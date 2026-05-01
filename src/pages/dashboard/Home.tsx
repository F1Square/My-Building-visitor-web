import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ALL_MODULES, MODULE_VISIBILITY, SUBSCRIPTION_GATED_MODULES, getGreeting, filterModules } from '../../lib/modules';
import { ModuleTile } from '../../components/ui/ModuleTile';
import { SearchInput } from '../../components/ui/SearchInput';
import { Bell, Building2, UserPlus, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import api from '../../lib/apiClient';
import type { UnreadCounts } from '../../types';
import * as LucideIcons from 'lucide-react';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!Icon) return <Building2 className={className} />;
  return <Icon className={className} />;
}

export default function Home() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const [showSubPrompt, setShowSubPrompt] = useState(false);

  useEffect(() => {
    if (user?.building_id) {
      api.get<UnreadCounts>('/notifications/unread-counts').then(setUnreadCounts).catch(() => {});
    }
  }, [user?.building_id]);

  const role = user?.role ?? 'user';
  const visibleKeys = MODULE_VISIBILITY[role] ?? [];
  const visibleModules = ALL_MODULES.filter(m => visibleKeys.includes(m.key));
  const filtered = filterModules(visibleModules, query);

  const hasActiveSub = subscription?.status === 'active';

  const handleModuleClick = useCallback((key: string, path: string) => {
    if (SUBSCRIPTION_GATED_MODULES.includes(key) && !hasActiveSub && role !== 'admin') {
      setShowSubPrompt(true);
      return;
    }
    navigate(path);
  }, [hasActiveSub, navigate, role]);

  const greeting = getGreeting(new Date().getHours());
  const firstName = user?.name?.split(' ')[0] ?? '';

  // Pending user — no building
  if (user && !user.building_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <Building2 className="w-16 h-16 text-blue-300" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">You're not in a building yet</h2>
          <p className="text-gray-500 mt-2">Join an existing society or register a new one to get started.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/join')} className="gap-2">
            <UserPlus className="w-4 h-4" /> Join Building
          </Button>
          <Button variant="outline" onClick={() => navigate('/register-society')} className="gap-2">
            <PlusCircle className="w-4 h-4" /> Register Society
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{user?.building_name || (user?.role === 'admin' ? 'Admin Panel' : 'My Building')} 👋</h1>

      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput placeholder="Search modules..." onSearch={setQuery} />
      </div>

      {/* Subscription prompt */}
      {showSubPrompt && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800">This feature requires an active subscription.</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate('/dashboard/subscribe')}>View Plans</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSubPrompt(false)}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* Module grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {filtered.map(m => {
          const locked = SUBSCRIPTION_GATED_MODULES.includes(m.key) && !hasActiveSub && role !== 'admin';
          const badgeCount = Object.entries(unreadCounts).reduce((sum, [type, count]) => {
            // Map notification types to module keys
            const typeToModule: Record<string, string> = {
              bill: 'maintenance', payment: 'maintenance', reminder: 'maintenance',
              visitor: 'visitors', announcement: 'announcements', announcement_urgent: 'announcements',
              join_request: 'join-requests', parking_report: 'parking',
            };
            return typeToModule[type] === m.key ? sum + count : sum;
          }, 0);

          return (
            <ModuleTile
              key={m.key}
              moduleKey={m.key}
              label={m.label}
              icon={<DynamicIcon name={m.icon} className="w-6 h-6" />}
              badgeCount={badgeCount}
              locked={locked}
              onClick={() => handleModuleClick(m.key, m.path)}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 mt-12">No modules match "{query}"</p>
      )}
    </div>
  );
}
