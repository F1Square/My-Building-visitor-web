import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../components/ui/use-toast';
import { MailOpen, Phone } from 'lucide-react';
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
      await api.patch(`/inquiries/${id}`, { status: 'reviewed' });
      toast({ title: 'Marked as reviewed' });
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
          {inquiries.map((i) => (
            <div key={i.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{i.society_name || 'Society inquiry'}</p>
                  <p className="text-sm text-gray-500">
                    {[i.user_name, i.user_email].filter(Boolean).join(' · ') || '—'}
                  </p>
                  {i.user_phone ? (
                    <a
                      href={`tel:${i.user_phone}`}
                      className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B5FC0] hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {i.user_phone}
                    </a>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={i.status === 'reviewed' || i.status === 'approved' ? 'secondary' : 'default'} className="text-xs capitalize">
                    {i.status ?? 'pending'}
                  </Badge>
                  <p className="text-xs text-gray-400">{new Date(i.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              {(i.city || i.state) ? (
                <p className="text-sm text-gray-700">{[i.city, i.state].filter(Boolean).join(', ')}</p>
              ) : null}
              {i.status === 'pending' && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => handleResolve(i.id)}>
                  Mark Reviewed
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
