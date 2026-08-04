import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { RecordDetailRows } from '../../../components/ui/RecordDetailRows';
import { useToast } from '../../../components/ui/use-toast';
import { MailOpen, Phone } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { Inquiry } from '../../../types';

const STATUSES = ['pending', 'reviewed', 'approved', 'rejected'] as const;

export default function Inquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Inquiry | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchInquiries = () => {
    setLoading(true);
    api.get<Inquiry[]>('/inquiries').then(setInquiries).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchInquiries(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const res = await api.patch<{ inquiry: Inquiry }>(`/inquiries/${id}`, { status });
      const updated = res.inquiry ?? { status };
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
      setDetail((prev) => (prev?.id === id ? { ...prev, ...updated } : prev));
      toast({ title: `Marked as ${status}` });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setUpdating(false);
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
            <button
              key={i.id}
              type="button"
              onClick={() => setDetail(i)}
              className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{i.society_name || 'Society inquiry'}</p>
                  <p className="text-sm text-gray-500">
                    {[i.user_name, i.user_email].filter(Boolean).join(' · ') || '—'}
                  </p>
                  {i.user_phone ? (
                    <p className="mt-1 text-sm font-semibold text-[#3B5FC0]">{i.user_phone}</p>
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
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.society_name || 'Society inquiry'}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 mt-1">
              {detail.society_logo ? (
                <div className="flex justify-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <img src={detail.society_logo} alt="Society logo" className="h-20 w-20 object-contain rounded-lg" />
                </div>
              ) : null}
              <Badge className="capitalize" variant={detail.status === 'pending' ? 'default' : 'secondary'}>
                {detail.status ?? 'pending'}
              </Badge>
              <RecordDetailRows
                rows={[
                  ['Submitted by', detail.user_name],
                  ['Email', detail.user_email],
                  [
                    'Mobile',
                    detail.user_phone ? (
                      <a href={`tel:${detail.user_phone}`} className="inline-flex items-center gap-1 text-[#3B5FC0] hover:underline">
                        <Phone className="w-3.5 h-3.5" />
                        {detail.user_phone}
                      </a>
                    ) : null,
                  ],
                  ['Society type', detail.society_type],
                  ['Wings', detail.total_wings],
                  ['City', detail.city],
                  ['State', detail.state],
                  ['Pincode', detail.pincode],
                  ['Address', detail.address],
                  ['Late fee', detail.late_fee != null ? `₹${detail.late_fee}` : null],
                  ['Fixed maintenance', detail.maintenance_fixed == null ? null : detail.maintenance_fixed ? 'Yes' : 'No'],
                  ['Water bill separate', detail.water_bill_separate == null ? null : detail.water_bill_separate ? 'Yes' : 'No'],
                  ['Payment method', detail.payment_method],
                  ['Payment T&C', detail.payment_tc],
                  ['Admin note', detail.admin_note],
                  ['Submitted', new Date(detail.created_at).toLocaleString('en-IN')],
                ]}
              />
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={detail.status === s ? 'default' : 'outline'}
                      className="capitalize"
                      disabled={updating || detail.status === s}
                      onClick={() => updateStatus(detail.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
