import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/badge';
import { Users } from 'lucide-react';
import api from '../../lib/apiClient';
import type { Member } from '../../types';

export function filterMembers(members: Member[], query: string): Member[] {
  if (!query.trim()) return members;
  const q = query.toLowerCase();
  return members.filter(m =>
    m.name.toLowerCase().includes(q) || (m.flat_no ?? '').toLowerCase().includes(q)
  );
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembers = () => {
    setLoading(true); setError('');
    api.get<Member[]>('/buildings/members')
      .then(data => { setMembers(data); setFiltered(data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSearch = useCallback((q: string) => {
    setFiltered(filterMembers(members, q));
  }, [members]);

  if (loading) return <div><LoadingSkeleton /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchMembers} />;

  return (
    <div>
      <PageHeader title="Members" subtitle={`${members.length} members`} />
      <div className="mb-4">
        <SearchInput placeholder="Search by name or flat..." onSearch={handleSearch} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-12 h-12 text-gray-300" />} title="No members found" />
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {m.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{m.name}</p>
                <p className="text-sm text-gray-500">{m.flat_no ? `Flat ${m.flat_no}` : ''}{m.wing ? ` · Wing ${m.wing}` : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className="capitalize text-xs">{m.role}</Badge>
                {m.phone && <p className="text-xs text-gray-400">{m.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
