import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import { UserPlus, Check, X } from 'lucide-react';
import api from '../../lib/apiClient';

interface JoinReq {
  id: string;
  users?: { name: string; email: string; phone?: string };
  flat_no?: string;
  status: string;
  created_at: string;
}

export default function JoinRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<JoinReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchRequests = () => {
    setLoading(true);
    // Pramukh endpoint for pending join requests
    api.get<JoinReq[]>('/buildings/join/pending')
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActing(id);
    try {
      await api.post('/buildings/join/handle', { request_id: id, action });
      toast({ title: action === 'approve' ? 'Request approved ✅' : 'Request rejected' });
      fetchRequests();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setActing(null); }
  };

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Join Requests" subtitle={`${requests.length} pending`} />
      {requests.length === 0 ? (
        <EmptyState icon={<UserPlus className="w-12 h-12 text-gray-300" />} title="No pending requests" description="All join requests have been handled." />
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{r.users?.name ?? 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{r.users?.email}</p>
                  {r.users?.phone && <p className="text-sm text-gray-500">{r.users.phone}</p>}
                  {r.flat_no && <p className="text-sm text-gray-500">Flat {r.flat_no}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" disabled={acting === r.id} onClick={() => handleAction(r.id, 'approve')}
                    className="gap-1 bg-green-600 hover:bg-green-700">
                    <Check className="w-3 h-3" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" disabled={acting === r.id} onClick={() => handleAction(r.id, 'reject')}
                    className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                    <X className="w-3 h-3" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
