import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { RecordDetailRows } from '../../../components/ui/RecordDetailRows';
import { Users2 } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { Member } from '../../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Member | null>(null);

  useEffect(() => {
    api.get<Member[]>('/buildings/admin/users').then(data => { setUsers(data); setFiltered(data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) { setFiltered(users); return; }
    const lq = q.toLowerCase();
    setFiltered(users.filter(u =>
      u.name?.toLowerCase().includes(lq)
      || (u.email ?? '').toLowerCase().includes(lq)
      || (u.phone ?? '').toLowerCase().includes(lq)
      || (u.flat_no ?? '').toLowerCase().includes(lq)
      || (u.building_name ?? '').toLowerCase().includes(lq),
    ));
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
            <button
              key={u.id}
              type="button"
              onClick={() => setDetail(u)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {[u.email, u.flat_no ? `Flat ${u.flat_no}` : null].filter(Boolean).join(' · ')}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize text-xs shrink-0">{u.role}</Badge>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.name || 'User'}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 mt-1">
              <Badge variant="secondary" className="capitalize">{detail.role}</Badge>
              <RecordDetailRows
                rows={[
                  ['Email', detail.email],
                  ['Phone', detail.phone ? <a href={`tel:${detail.phone}`} className="text-[#3B5FC0] hover:underline">{detail.phone}</a> : null],
                  ['Wing', detail.wing],
                  ['Flat', detail.flat_no],
                  ['Building', detail.building_name],
                  ['Status', detail.status],
                  ['Joined', detail.created_at ? new Date(detail.created_at).toLocaleString('en-IN') : null],
                ]}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
