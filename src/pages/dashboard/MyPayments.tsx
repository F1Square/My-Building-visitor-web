import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { UploadProgressBar } from '../../components/ui/UploadProgressBar';
import { Lock, Receipt, Banknote, Upload, Download, Smartphone } from 'lucide-react';
import { MobileAppPrompt, MobileOnlyButton } from '../../components/ui/MobileAppPrompt';
import api from '../../lib/apiClient';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface PaymentItem {
  id: string;
  amount: number;
  display_amount?: number;
  amount_due?: number;
  penalty_amount?: number;
  status: string;
  is_overdue?: boolean;
  building_payment_method?: string;
  building_payment_tc?: string;
  maintenance_bills?: {
    month?: number;
    year?: number;
    due_date?: string;
    description?: string;
  };
}

function getPaymentActions(status: string, paymentMethod: string | null): ('pay_now' | 'mark_cash' | 'upload_receipt')[] {
  if (status !== 'pending' && status !== 'partial') return [];
  const m = paymentMethod ?? 'Online (Payment Gateway)';
  const actions: ('pay_now' | 'mark_cash' | 'upload_receipt')[] = [];
  if (m === 'Online (Payment Gateway)' || m === 'Both Cash & Online' || m === 'Cheque & Online') {
    actions.push('pay_now');
  }
  if (m === 'Cash Only' || m === 'Both Cash & Online') actions.push('mark_cash');
  if (m === 'Cheque' || m === 'Cheque & Online') actions.push('upload_receipt');
  if (actions.length === 0) actions.push('pay_now');
  return actions;
}

export default function MyPayments() {
  const { user, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [cashConfirmId, setCashConfirmId] = useState<string | null>(null);
  const [tcExpanded, setTcExpanded] = useState(false);

  const isLocked = user?.role !== 'admin' && !hasActiveSubscription;

  const fetchPayments = useCallback(async () => {
    try {
      const data = await api.get<PaymentItem[]>('/maintenance/payments?mine=true');
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLocked) {
      setLoading(false);
      return;
    }
    void fetchPayments();
  }, [isLocked, fetchPayments]);

  const buildingPaymentMethod = payments[0]?.building_payment_method ?? null;
  const buildingPaymentTc = payments[0]?.building_payment_tc ?? null;

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((s, p) => s + Number(p.display_amount ?? p.amount), 0);
  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'partial')
    .reduce((s, p) => s + Number(p.amount_due ?? p.display_amount ?? p.amount), 0);

  const markCash = async (recordId: string) => {
    try {
      await api.post(`/maintenance/payments/${recordId}/request-cash`);
      toast({ title: 'Cash payment requested', description: 'Please pay in person to your pramukh/admin.' });
      void fetchPayments();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCashConfirmId(null);
    }
  };

  const uploadReceipt = async (recordId: string, file: File) => {
    setUploadingId(recordId);
    setUploadProgress(0);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await api.upload(`/maintenance/payments/${recordId}/receipt`, { receipt_url: base64 }, {
        method: 'PATCH',
        onProgress: setUploadProgress,
      });
      toast({ title: 'Receipt uploaded' });
      void fetchPayments();
    } catch (e: unknown) {
      toast({ title: 'Upload failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setUploadingId(null);
      setUploadProgress(null);
    }
  };

  const downloadReceipt = async (recordId: string) => {
    const token = localStorage.getItem('mb_token');
    const base = import.meta.env.VITE_API_BASE || 'https://my-building-backend.vercel.app/api';
    window.open(`${base}/maintenance/receipt/${recordId}?token=${token}`, '_blank');
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
        <Lock className="w-12 h-12 text-blue-400" />
        <h2 className="text-xl font-bold text-gray-900">Subscription Required</h2>
        <p className="text-gray-500 max-w-sm">Subscribe to view your maintenance payment history and pay bills.</p>
        <Button onClick={() => navigate('/dashboard/subscribe')}>View Plans</Button>
      </div>
    );
  }

  if (loading) return <div><LoadingSkeleton rows={4} /></div>;

  return (
    <div>
      <PageHeader title="My Payments" subtitle="View history on web - pay online in the mobile app" />

      <MobileAppPrompt feature="maintenance-payment" variant="banner" className="mb-5" />

      {payments.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-4 bg-white rounded-2xl border-l-4 border-green-500 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">Total Paid</p>
            <p className="text-xl font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border-l-4 border-amber-500 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">Pending</p>
            <p className="text-xl font-bold text-amber-600">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {buildingPaymentTc && (
        <button
          type="button"
          className="w-full mb-4 p-4 bg-white rounded-2xl border border-gray-100 text-left"
          onClick={() => setTcExpanded(e => !e)}
        >
          <p className="text-sm font-semibold text-blue-600 flex items-center justify-between">
            Payment Terms & Conditions
            <span className="text-xs">{tcExpanded ? '▲' : '▼'}</span>
          </p>
          {tcExpanded && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{buildingPaymentTc}</p>}
        </button>
      )}

      {payments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-12 h-12 text-gray-300" />}
          title="No payment records"
          description="Your maintenance bills will appear here"
        />
      ) : (
        <div className="space-y-3">
          {payments.map(item => {
            const bill = item.maintenance_bills;
            const isPaid = item.status === 'paid';
            const isReceiptUploaded = item.status === 'receipt_uploaded';
            const actions = getPaymentActions(item.status, buildingPaymentMethod);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border ${isPaid || isReceiptUploaded ? 'border-green-100' : 'border-gray-100'}`}
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-700">{MONTHS[bill?.month ?? 0]}</span>
                    <span className="text-sm font-bold text-blue-900">{bill?.year}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{Number(item.display_amount ?? item.amount).toLocaleString('en-IN')}
                    </p>
                    {item.is_overdue && item.penalty_amount ? (
                      <p className="text-xs text-red-500">
                        Bill ₹{Number(item.amount).toLocaleString('en-IN')} + Penalty ₹{Number(item.penalty_amount).toLocaleString('en-IN')}
                      </p>
                    ) : null}
                    {bill?.description && <p className="text-xs text-gray-500 truncate">{bill.description}</p>}
                    {bill?.due_date && (
                      <p className="text-xs text-gray-400">
                        Due: {new Date(bill.due_date).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                  <Badge variant={isPaid ? 'default' : isReceiptUploaded ? 'secondary' : 'destructive'} className="capitalize shrink-0">
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {actions.includes('pay_now') && (
                    <MobileOnlyButton feature="maintenance-payment" className="gap-1 h-8 text-xs px-3">
                      <Smartphone className="w-3.5 h-3.5" /> Pay in app
                    </MobileOnlyButton>
                  )}
                  {actions.includes('mark_cash') && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setCashConfirmId(item.id)}>
                      <Banknote className="w-3.5 h-3.5" /> Mark Cash
                    </Button>
                  )}
                  {actions.includes('upload_receipt') && (
                    <label className="inline-flex">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) void uploadReceipt(item.id, f);
                          e.target.value = '';
                        }}
                      />
                      <Button size="sm" variant="outline" className="gap-1" disabled={uploadingId === item.id} asChild>
                        <span>
                          <Upload className="w-3.5 h-3.5" />{' '}
                          {uploadingId === item.id
                            ? (uploadProgress != null ? `Uploading… ${uploadProgress}%` : 'Uploading...')
                            : 'Upload Receipt'}
                        </span>
                      </Button>
                    </label>
                  )}
                  {isPaid && (
                    <Button size="sm" variant="ghost" className="gap-1" onClick={() => downloadReceipt(item.id)}>
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </Button>
                  )}
                </div>
                {uploadingId === item.id && (
                  <UploadProgressBar progress={uploadProgress} className="mt-3 w-full space-y-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!cashConfirmId}
        onOpenChange={o => !o && setCashConfirmId(null)}
        title="Confirm Cash Payment"
        description="Submit this bill as cash payment for Pramukh approval? Cancel if you tapped Cash by mistake."
        confirmLabel="Submit Cash"
        onConfirm={() => { if (cashConfirmId) void markCash(cashConfirmId); }}
      />
    </div>
  );
}
