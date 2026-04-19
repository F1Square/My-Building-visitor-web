import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Badge } from '../../../components/ui/badge';
import { Users2 } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { Member } from '../../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Member[]>('/buildings/admin/users').then(data => { setUsers(data); setFiltered(data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) { setFiltered(users); return; }
    const lq = q.toLowerCase();
    setFiltered(users.filter(u => u.name.toLowerCase().includes(lq) || (u.flat_no ?? '').toLowerCase().includes(lq)));
  }, [users]);

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Users" subtitle={`${users.length} total`} />
      <div className="mb-4"><SearchInput placeholder="Search users..." onSearch={handleSearch} /></div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Users2 className="w-12 h-12 text-gray-300" />} title="No users found" />
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{u.name}</p>
                {u.flat_no && <p className="text-xs text-gray-400">Flat {u.flat_no}</p>}
              </div>
              <Badge variant="secondary" className="capitalize text-xs">{u.role}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
