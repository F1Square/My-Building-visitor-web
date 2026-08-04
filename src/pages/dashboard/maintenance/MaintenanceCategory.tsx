import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useToast } from '../../../components/ui/use-toast';
import { UploadProgressBar } from '../../../components/ui/UploadProgressBar';
import { Receipt, Home, Banknote, Upload, Smartphone, CheckCircle, Trash2, FileText } from 'lucide-react';
import { MobileAppPrompt, MobileOnlyButton } from '../../../components/ui/MobileAppPrompt';
import api from '../../../lib/apiClient';

interface PaymentRecord {
  id: string;
  amount: number;
  flat_amount?: number;
  total_amount?: number;
  display_amount?: number;
  penalty_amount?: number;
  status: 'pending' | 'paid' | 'receipt_uploaded' | 'partial' | 'cash_requested';
  category: string;
  is_overdue?: boolean;
  building_payment_method?: string;
  users?: { name: string; flat_no?: string };
  maintenance_bills?: {
    month?: number;
    year?: number;
    due_date?: string;
    description?: string;
    category?: string;
    penalty_amount?: number;
  };
}

interface MaintenanceBill {
  id: string;
  category: string;
  amount?: number;
  month?: number;
  year?: number;
  due_date?: string;
  description?: string;
  created_at?: string;
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

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const LABELS: Record<string, string> = {
  maintenance: 'Maintenance Bill', water_meter: 'Water Meter', special: 'Special Bills',
};

const STATUS_LABEL: Record<string, string> = {
  paid: 'Paid', receipt_uploaded: 'Receipt Uploaded', pending: 'Pending', cash_requested: 'Cash Requested',
};
const STATUS_COLOR: Record<string, 'default' | 'secondary' | 'destructive'> = {
  paid: 'default', receipt_uploaded: 'secondary', pending: 'destructive', cash_requested: 'secondary',
};

export default function MaintenanceCategory() {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const [cashConfirmId, setCashConfirmId] = useState<string | null>(null);
  const [managerTab, setManagerTab] = useState<'payments' | 'bills'>('payments');

  const isPramukh = user?.role === 'pramukh';
  const isAdmin = user?.role === 'admin';
  const isManager = isPramukh || isAdmin;

  const buildingIdFromUrl = searchParams.get('building_id') ?? undefined;
  const buildingName = searchParams.get('building_name') ?? undefined;
  const effectiveBuildingId = isAdmin ? buildingIdFromUrl : user?.building_id ?? undefined;
  const maintenanceBackUrl = effectiveBuildingId
    ? `/dashboard/maintenance?building_id=${effectiveBuildingId}${buildingName ? `&building_name=${encodeURIComponent(buildingName)}` : ''}`
    : '/dashboard/maintenance';

  const loadRecords = () => {
    if (isAdmin && !effectiveBuildingId) {
      setRecords([]);
      setBills([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const payParams: Record<string, string> = { category: category ?? 'maintenance' };
    if (isManager && !isAdmin) {
      // pramukh sees all society payments in category
    } else if (!isManager) {
      payParams.mine = 'true';
    }
    if (effectiveBuildingId) payParams.building_id = effectiveBuildingId;

    const billParams: Record<string, string> = { category: category ?? 'maintenance' };
    if (effectiveBuildingId) billParams.building_id = effectiveBuildingId;

    const requests: [Promise<PaymentRecord[]>, Promise<MaintenanceBill[] | null>] = [
      api.get<PaymentRecord[]>('/maintenance/payments', payParams),
      isManager
        ? api.get<MaintenanceBill[]>('/maintenance/bills', billParams)
        : Promise.resolve(null),
    ];

    Promise.all(requests)
      .then(([data, billsData]) => {
        const filtered = data.filter(p => {
          const cat = p.category || p.maintenance_bills?.category || 'maintenance';
          return cat === category;
        });
        setRecords(filtered);
        setBills(billsData ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, [category, isManager, effectiveBuildingId]);

  const buildingPaymentMethod = records[0]?.building_payment_method ?? null;

  const markCash = async (recordId: string) => {
    try {
      await api.post(`/maintenance/payments/${recordId}/request-cash`);
      toast({ title: 'Cash payment requested' });
      loadRecords();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCashConfirmId(null);
    }
  };

  const approvePayment = async (recordId: string) => {
    try {
      await api.patch(`/maintenance/payments/${recordId}/approve`);
      toast({ title: 'Payment approved' });
      loadRecords();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const deleteBill = async () => {
    if (!deleteBillId) return;
    try {
      await api.delete(`/maintenance/bills/${deleteBillId}`);
      toast({ title: 'Bill deleted' });
      loadRecords();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setDeleteBillId(null);
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
      loadRecords();
    } catch (e: unknown) {
      toast({ title: 'Upload failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setUploadingId(null);
      setUploadProgress(null);
    }
  };

  const byStatus = (s: string) => records.filter(r => r.status === s);
  const pending = byStatus('pending');
  const awaitingApproval = records.filter(r => r.status === 'receipt_uploaded' || r.status === 'cash_requested');
  const paid = [...byStatus('paid'), ...byStatus('receipt_uploaded')].filter(r => r.status === 'paid');

  if (isAdmin && !effectiveBuildingId) {
    return (
      <div>
        <PageHeader title={LABELS[category ?? ''] ?? 'Bills'} showBack onBack={() => navigate(maintenanceBackUrl)} />
        <EmptyState icon={<Receipt className="w-12 h-12 text-gray-300" />} title="Building not selected" description="Go back to Maintenance and select a society." />
      </div>
    );
  }

  if (loading) return <div className="p-4"><LoadingSkeleton /></div>;

  const renderCard = (r: PaymentRecord) => {
    const bill = r.maintenance_bills;
    const displayAmt = r.display_amount ?? r.total_amount ?? r.flat_amount ?? r.amount;
    const dueDate = bill?.due_date;
    const penaltyAmt = Number(r.penalty_amount || bill?.penalty_amount || 0);
    const needsApproval = r.status === 'receipt_uploaded' || r.status === 'cash_requested';

    return (
      <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {isManager && r.users && (
              <div className="flex items-center gap-1.5 mb-2">
                <Home className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700">
                  {r.users.flat_no ? `Flat ${r.users.flat_no}` : r.users.name}
                </span>
                {r.users.flat_no && r.users.name && (
                  <span className="text-xs text-gray-400">· {r.users.name}</span>
                )}
              </div>
            )}
            {bill?.month && bill?.year && (
              <p className="font-bold text-gray-900">{MONTHS[bill.month]} {bill.year}</p>
            )}
            {dueDate && (
              <p className={`text-xs mt-0.5 ${r.is_overdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                {r.is_overdue ? '⚠️ Overdue · ' : ''}Due: {new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
            {bill?.description && (
              <p className="text-xs text-gray-400 mt-1">{bill.description}</p>
            )}
            {penaltyAmt > 0 && r.status === 'pending' && (
              <p className="text-xs text-red-500 mt-1">Late penalty: ₹{Number(penaltyAmt).toLocaleString('en-IN')}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <p className="text-xl font-bold text-gray-900">₹{Number(displayAmt).toLocaleString('en-IN')}</p>
            <Badge variant={STATUS_COLOR[r.status] ?? 'secondary'}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
          </div>
        </div>

        {isManager && needsApproval && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button size="sm" className="gap-1 w-full" onClick={() => approvePayment(r.id)}>
              <CheckCircle className="w-4 h-4" /> Approve payment
            </Button>
          </div>
        )}

        {!isManager && (r.status === 'pending' || r.status === 'partial') && (
          <div className="space-y-2 mt-3">
            {getPaymentActions(r.status, buildingPaymentMethod).includes('pay_now') && (
              <MobileAppPrompt feature="maintenance-payment" variant="compact" />
            )}
            <div className="flex flex-wrap gap-2">
              {getPaymentActions(r.status, buildingPaymentMethod).includes('pay_now') && (
                <MobileOnlyButton feature="maintenance-payment" className="gap-1 h-8 text-xs px-3">
                  <Smartphone className="w-3.5 h-3.5" /> Pay in app
                </MobileOnlyButton>
              )}
              {getPaymentActions(r.status, buildingPaymentMethod).includes('mark_cash') && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setCashConfirmId(r.id)}>
                  <Banknote className="w-3.5 h-3.5" /> Mark Cash
                </Button>
              )}
              {getPaymentActions(r.status, buildingPaymentMethod).includes('upload_receipt') && (
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) void uploadReceipt(r.id, f);
                      e.target.value = '';
                    }}
                  />
                  <Button size="sm" variant="outline" className="gap-1" disabled={uploadingId === r.id} asChild>
                    <span>
                      <Upload className="w-3.5 h-3.5" />{' '}
                      {uploadingId === r.id
                        ? (uploadProgress != null ? `Uploading… ${uploadProgress}%` : 'Uploading...')
                        : 'Upload Receipt'}
                    </span>
                  </Button>
                </label>
              )}
            </div>
            {uploadingId === r.id && (
              <UploadProgressBar progress={uploadProgress} className="w-full space-y-1.5" />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBill = (b: MaintenanceBill) => (
    <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start justify-between gap-3">
      <div>
        {b.month && b.year && <p className="font-bold text-gray-900">{MONTHS[b.month]} {b.year}</p>}
        {b.description && <p className="text-sm text-gray-600 mt-0.5">{b.description}</p>}
        {b.due_date && (
          <p className="text-xs text-gray-400 mt-1">
            Due: {new Date(b.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
        {b.amount != null && (
          <p className="text-sm font-semibold text-gray-800 mt-1">₹{Number(b.amount).toLocaleString('en-IN')}</p>
        )}
      </div>
      {isAdmin && (
        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1 shrink-0" onClick={() => setDeleteBillId(b.id)}>
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={LABELS[category ?? ''] ?? 'Bills'}
        subtitle={isAdmin && buildingName ? buildingName : `${records.length} total · ${pending.length} pending`}
        showBack
        onBack={() => navigate(maintenanceBackUrl)}
      />

      {isManager && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setManagerTab('payments')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${managerTab === 'payments' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            Member Payments
          </button>
          <button
            onClick={() => setManagerTab('bills')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${managerTab === 'bills' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            All Bills ({bills.length})
          </button>
        </div>
      )}

      {isManager && managerTab === 'bills' ? (
        bills.length === 0 ? (
          <EmptyState icon={<FileText className="w-12 h-12 text-gray-300" />} title="No bills yet" description="Create a bill from the Maintenance hub." />
        ) : (
          <div className="space-y-3">{bills.map(renderBill)}</div>
        )
      ) : records.length === 0 ? (
        <EmptyState icon={<Receipt className="w-12 h-12 text-gray-300" />} title="No bills found" description="No bills in this category yet." />
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending {pending.length > 0 && <span className="ml-1.5 bg-red-100 text-red-700 text-xs rounded-full px-1.5">{pending.length}</span>}
            </TabsTrigger>
            {isManager && awaitingApproval.length > 0 && (
              <TabsTrigger value="approval">
                Awaiting approval <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs rounded-full px-1.5">{awaitingApproval.length}</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="paid">
              Paid {paid.length > 0 && <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs rounded-full px-1.5">{paid.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pending.length === 0
              ? <EmptyState title="All paid up! 🎉" description="No pending bills in this category." />
              : <div className="space-y-3">{pending.map(renderCard)}</div>}
          </TabsContent>

          {isManager && (
            <TabsContent value="approval">
              {awaitingApproval.length === 0
                ? <EmptyState title="Nothing to approve" />
                : <div className="space-y-3">{awaitingApproval.map(renderCard)}</div>}
            </TabsContent>
          )}

          <TabsContent value="paid">
            {paid.length === 0
              ? <EmptyState title="No paid bills yet" />
              : <div className="space-y-3">{paid.map(renderCard)}</div>}
          </TabsContent>
        </Tabs>
      )}

      <ConfirmDialog
        open={!!deleteBillId}
        onOpenChange={o => !o && setDeleteBillId(null)}
        title="Delete bill?"
        description="This will remove the bill and related payment records. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={deleteBill}
      />
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
