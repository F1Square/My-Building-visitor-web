import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/input';
import { ListOrdered } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { ActivityLog } from '../../../types';

type ActivityLogsResponse = {
  logs?: ActivityLog[];
  total?: number;
};

function normalizeLogs(payload: unknown): ActivityLog[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray((payload as ActivityLogsResponse).logs)) {
    return (payload as ActivityLogsResponse).logs ?? [];
  }
  return [];
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');

  const fetchLogs = useCallback((dateFilter = date) => {
    setLoading(true);
    const params: Record<string, string> = { limit: '100', offset: '0' };
    if (dateFilter) params.date = dateFilter;

    api
      .get<ActivityLogsResponse | ActivityLog[]>('/activity-logs', params)
      .then((data) => setLogs(normalizeLogs(data)))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <PageHeader title="Activity Logs" />
      <div className="flex gap-3 mb-4">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Date"
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => fetchLogs()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Filter
        </button>
        {date && (
          <button
            type="button"
            onClick={() => {
              setDate('');
              fetchLogs('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Clear
          </button>
        )}
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : logs.length === 0 ? (
        <EmptyState icon={<ListOrdered className="w-12 h-12 text-gray-300" />} title="No logs found" />
      ) : (
        <div className="space-y-2">
          {logs.map((l) => {
            const isError = l.detail?.level === 'error' || l.action?.startsWith('error_');
            return (
              <div key={l.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{l.user_name ?? 'Unknown'}</p>
                    <p className={`text-xs ${isError ? 'text-red-600' : 'text-gray-500'}`}>
                      {l.action}
                      {l.module ? ` · ${l.module}` : ''}
                      {l.user_role ? ` · ${l.user_role}` : ''}
                    </p>
                    {isError && typeof l.detail?.error_message === 'string' && (
                      <p className="text-xs text-red-500 mt-1 line-clamp-2">{l.detail.error_message}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(l.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
