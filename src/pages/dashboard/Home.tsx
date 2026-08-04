import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getModulesForRole, SUBSCRIPTION_GATED_MODULES, filterModules } from '../../lib/modules';
import { ModuleTile } from '../../components/ui/ModuleTile';
import { SearchInput } from '../../components/ui/SearchInput';
import { MobileAppPrompt, MobileOnlyButton } from '../../components/ui/MobileAppPrompt';
import { Bell, Building2, UserPlus, PlusCircle, Smartphone } from 'lucide-react';
import { Button } from '../../components/ui/button';
import api from '../../lib/apiClient';
import type { UnreadCounts } from '../../types';
import * as LucideIcons from 'lucide-react';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!Icon) return <Building2 className={className} />;
  return <Icon className={className} />;
}

export default function Home() {
  const { user, subscription, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const [showSubPrompt, setShowSubPrompt] = useState(false);
  const [subPromptMessage, setSubPromptMessage] = useState('This feature requires an active subscription.');

  useEffect(() => {
    if (user?.building_id) {
      api.get<UnreadCounts>('/notifications/unread-counts').then(setUnreadCounts).catch(() => {});
    }
  }, [user?.building_id]);

  const role = user?.role ?? 'user';
  const visibleModules = getModulesForRole(role);
  const filtered = filterModules(visibleModules, query);

  const hasNewspaperAddon =
    subscription?.newspaper_addon === true &&
    (!subscription?.expires_at || new Date(subscription.expires_at) > new Date());

  const handleModuleClick = useCallback((key: string, path: string) => {
    if (key === 'newspaper' && role !== 'admin' && !hasNewspaperAddon) {
      setSubPromptMessage('The Newspaper module requires an active subscription with the Newspaper add-on.');
      setShowSubPrompt(true);
      return;
    }
    if (SUBSCRIPTION_GATED_MODULES.includes(key) && !hasActiveSubscription && role !== 'admin') {
      setSubPromptMessage('This feature requires an active subscription.');
      setShowSubPrompt(true);
      return;
    }
    navigate(path);
  }, [hasActiveSubscription, hasNewspaperAddon, navigate, role]);

  // Pending resident — no building (admins are platform-wide and skip this)
  if (user && user.role !== 'admin' && !user.building_id) {
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
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{user?.building_name || (user?.role === 'admin' ? 'Admin Dashboard' : 'My Building')} 👋</h1>

      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput placeholder="Search modules..." onSearch={setQuery} />
      </div>

      {/* Subscription prompt */}
      {showSubPrompt && (
        <div className="mb-4 space-y-3">
          <MobileAppPrompt
            feature={subPromptMessage.includes('Newspaper') ? 'newspaper-addon' : 'subscription'}
            variant="banner"
            message={subPromptMessage}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/subscribe')}>View plans</Button>
            <MobileOnlyButton feature="subscription" className="h-8 text-xs gap-1">
              <Smartphone className="w-3.5 h-3.5" /> Get app
            </MobileOnlyButton>
            <Button size="sm" variant="ghost" onClick={() => setShowSubPrompt(false)}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* Module grid */}
      <div className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 justify-items-stretch">
        {filtered.map(m => {
          const isNewspaperLocked = m.key === 'newspaper' && role !== 'admin' && !hasNewspaperAddon;
          const locked = isNewspaperLocked || (SUBSCRIPTION_GATED_MODULES.includes(m.key) && !hasActiveSubscription && role !== 'admin');
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
