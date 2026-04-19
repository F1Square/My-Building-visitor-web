import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/input';
import { ListOrdered } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { ActivityLog } from '../../../types';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    api.get<ActivityLog[]>(`/activity-logs?${params}`).then(setLogs).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div>
      <PageHeader title="Activity Logs" />
      <div className="flex gap-3 mb-4">
        <Input type="date" value={from} onChange={e => setFrom(e.target.value)} placeholder="From" className="flex-1" />
        <Input type="date" value={to} onChange={e => setTo(e.target.value)} placeholder="To" className="flex-1" />
        <button onClick={fetchLogs} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Filter</button>
      </div>
      {loading ? <LoadingSkeleton /> : logs.length === 0 ? (
        <EmptyState icon={<ListOrdered className="w-12 h-12 text-gray-300" />} title="No logs found" />
      ) : (
        <div className="space-y-2">
          {logs.map(l => (
            <div key={l.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{l.users?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{l.action}{l.module ? ` · ${l.module}` : ''}</p>
                  {l.buildings?.name && <p className="text-xs text-gray-400">{l.buildings.name}</p>}
                </div>
                <p className="text-xs text-gray-400 shrink-0">{new Date(l.created_at).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
