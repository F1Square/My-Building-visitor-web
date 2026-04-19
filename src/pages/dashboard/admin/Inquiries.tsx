import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../components/ui/use-toast';
import { MailOpen } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { Inquiry } from '../../../types';

export default function Inquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = () => {
    setLoading(true);
    api.get<Inquiry[]>('/inquiries').then(setInquiries).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/inquiries/${id}`, { status: 'resolved' });
      toast({ title: 'Marked as resolved' });
      fetchInquiries();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Inquiries" subtitle={`${inquiries.length} total`} />
      {inquiries.length === 0 ? (
        <EmptyState icon={<MailOpen className="w-12 h-12 text-gray-300" />} title="No inquiries" />
      ) : (
        <div className="space-y-3">
          {inquiries.map(i => (
            <div key={i.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{i.name}</p>
                  <p className="text-sm text-gray-500">{i.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={i.status === 'resolved' ? 'secondary' : 'default'} className="text-xs capitalize">{i.status ?? 'open'}</Badge>
                  <p className="text-xs text-gray-400">{new Date(i.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{i.message}</p>
              {i.status !== 'resolved' && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => handleResolve(i.id)}>Mark Resolved</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
