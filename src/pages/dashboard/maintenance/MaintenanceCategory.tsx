import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Receipt, Home } from 'lucide-react';
import api from '../../../lib/apiClient';

interface PaymentRecord {
  id: string;
  amount: number;
  flat_amount?: number;
  total_amount?: number;
  display_amount?: number;
  penalty_amount?: number;
  status: 'pending' | 'paid' | 'receipt_uploaded';
  category: string;
  is_overdue?: boolean;
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

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const LABELS: Record<string, string> = {
  maintenance: 'Maintenance Bill', water_meter: 'Water Meter', special: 'Special Bills',
};

const STATUS_LABEL: Record<string, string> = {
  paid: 'Paid', receipt_uploaded: 'Receipt Uploaded', pending: 'Pending',
};
const STATUS_COLOR: Record<string, 'default' | 'secondary' | 'destructive'> = {
  paid: 'default', receipt_uploaded: 'secondary', pending: 'destructive',
};

export default function MaintenanceCategory() {
  const { category } = useParams<{ category: string }>();
  const { user } = useAuth();
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isPramukh = user?.role === 'pramukh';
  const isAdmin = user?.role === 'admin';
  const isManager = isPramukh || isAdmin;

  useEffect(() => {
    setLoading(true);
    // Pramukh/admin: get all records for building; user: get own only
    const endpoint = isManager
      ? `/maintenance/payments?category=${category}`
      : `/maintenance/payments?mine=true&category=${category}`;

    api.get<PaymentRecord[]>(endpoint)
      .then(data => {
        // Filter by category client-side as well (belt-and-suspenders)
        const filtered = data.filter(p => {
          const cat = p.category || p.maintenance_bills?.category || 'maintenance';
          return cat === category;
        });
        setRecords(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, isManager]);

  const byStatus = (s: string) => records.filter(r => r.status === s);
  const pending = byStatus('pending');
  const paid = [...byStatus('paid'), ...byStatus('receipt_uploaded')];

  if (loading) return <div className="p-4"><LoadingSkeleton /></div>;

  const renderCard = (r: PaymentRecord) => {
    const bill = r.maintenance_bills;
    const displayAmt = r.display_amount ?? r.total_amount ?? r.flat_amount ?? r.amount;
    const dueDate = bill?.due_date;
    const penaltyAmt = Number(r.penalty_amount || bill?.penalty_amount || 0);

    return (
      <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Flat number — shown for pramukh/admin */}
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

            {/* Bill period */}
            {bill?.month && bill?.year && (
              <p className="font-bold text-gray-900">{MONTHS[bill.month]} {bill.year}</p>
            )}

            {/* Due date */}
            {dueDate && (
              <p className={`text-xs mt-0.5 ${r.is_overdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                {r.is_overdue ? '⚠️ Overdue · ' : ''}Due: {new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}

            {/* Description */}
            {bill?.description && (
              <p className="text-xs text-gray-400 mt-1">{bill.description}</p>
            )}

            {/* Penalty */}
            {penaltyAmt > 0 && r.status === 'pending' && (
              <p className="text-xs text-red-500 mt-1">Late penalty: ₹{Number(penaltyAmt).toLocaleString('en-IN')}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <p className="text-xl font-bold text-gray-900">₹{Number(displayAmt).toLocaleString('en-IN')}</p>
            <Badge variant={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Badge>
          </div>
        </div>

        {/* Pay hint for user */}
        {!isManager && r.status === 'pending' && (
          <div className="mt-3 bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700">
            💡 To pay online, use the MyBuilding mobile app.
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title={LABELS[category ?? ''] ?? 'Bills'}
        subtitle={`${records.length} total · ${pending.length} pending`}
      />

      {records.length === 0 ? (
        <EmptyState icon={<Receipt className="w-12 h-12 text-gray-300" />} title="No bills found" description="No bills in this category yet." />
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending {pending.length > 0 && <span className="ml-1.5 bg-red-100 text-red-700 text-xs rounded-full px-1.5">{pending.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid {paid.length > 0 && <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs rounded-full px-1.5">{paid.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pending.length === 0
              ? <EmptyState title="All paid up! 🎉" description="No pending bills in this category." />
              : <div className="space-y-3">{pending.map(renderCard)}</div>}
          </TabsContent>

          <TabsContent value="paid">
            {paid.length === 0
              ? <EmptyState title="No paid bills yet" />
              : <div className="space-y-3">{paid.map(renderCard)}</div>}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
