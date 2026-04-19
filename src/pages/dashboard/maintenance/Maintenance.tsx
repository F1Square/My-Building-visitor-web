import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../components/ui/use-toast';
import { Wrench, Droplets, Receipt, Plus } from 'lucide-react';
import api from '../../../lib/apiClient';

interface PaymentRecord {
  id: string;
  status: string;
  category: string;
  amount: number;
  maintenance_bills?: { category?: string };
}

const CATEGORIES = [
  { key: 'maintenance', label: 'Maintenance Bill', subtitle: 'Monthly society charges', icon: Wrench, color: '#3B5FC0', bg: '#E8EEF9' },
  { key: 'water_meter', label: 'Water Meter', subtitle: 'Per-flat water charges', icon: Droplets, color: '#0D9488', bg: '#E0F7F4' },
  { key: 'special', label: 'Special Bills', subtitle: 'Ad-hoc or one-time charges', icon: Receipt, color: '#7C3AED', bg: '#EDE9FE' },
];

const MONTHS_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Maintenance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({ maintenance: 0, water_meter: 0, special: 0 });
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [billForm, setBillForm] = useState({
    category: 'maintenance', amount: '', month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()), due_date: '', description: '', penalty_amount: '',
  });
  const [creating, setCreating] = useState(false);

  const isPramukh = user?.role === 'pramukh';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // For user/pramukh: get own pending counts
    const endpoint = isPramukh || isAdmin
      ? '/maintenance/payments'
      : '/maintenance/payments?mine=true';

    api.get<PaymentRecord[]>(endpoint).then(data => {
      const c = { maintenance: 0, water_meter: 0, special: 0 };
      for (const p of data) {
        if (p.status === 'pending') {
          const cat = (p.category || p.maintenance_bills?.category || 'maintenance') as keyof typeof c;
          if (cat in c) c[cat]++;
        }
      }
      setCounts(c);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isPramukh, isAdmin]);

  const handleCreateBill = async () => {
    if (!billForm.due_date) {
      toast({ title: 'Error', description: 'Due date is required', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        category: billForm.category,
        due_date: billForm.due_date,
        description: billForm.description || undefined,
      };
      if (billForm.category === 'maintenance') {
        payload.amount = parseFloat(billForm.amount);
        payload.month = parseInt(billForm.month);
        payload.year = parseInt(billForm.year);
        if (billForm.penalty_amount) payload.penalty_amount = parseFloat(billForm.penalty_amount);
      } else {
        payload.amount = parseFloat(billForm.amount);
      }
      await api.post('/maintenance/bills', payload);
      toast({ title: 'Bill created', description: 'Members have been notified.' });
      setShowCreateBill(false);
      setBillForm({ category: 'maintenance', amount: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), due_date: '', description: '', penalty_amount: '' });
      // Refresh counts
      setLoading(true);
      api.get<PaymentRecord[]>('/maintenance/payments').then(data => {
        const c = { maintenance: 0, water_meter: 0, special: 0 };
        for (const p of data) {
          if (p.status === 'pending') {
            const cat = (p.category || p.maintenance_bills?.category || 'maintenance') as keyof typeof c;
            if (cat in c) c[cat]++;
          }
        }
        setCounts(c);
      }).catch(() => {}).finally(() => setLoading(false));
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setCreating(false); }
  };

  if (loading) return <div className="p-6"><LoadingSkeleton rows={3} /></div>;

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle={isPramukh || isAdmin ? 'Manage billing categories' : 'Select a billing category'}
        action={isPramukh || isAdmin
          ? <Button size="sm" onClick={() => setShowCreateBill(true)} className="gap-1"><Plus className="w-4 h-4" />Create Bill</Button>
          : undefined}
      />

      <div className="space-y-4">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const pending = counts[cat.key];
          return (
            <button
              key={cat.key}
              onClick={() => navigate(`/dashboard/maintenance/${cat.key}`)}
              className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg }}>
                <Icon className="w-7 h-7" style={{ color: cat.color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{cat.label}</p>
                <p className="text-sm text-gray-500">{cat.subtitle}</p>
              </div>
              {pending > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shrink-0">
                  {pending} pending
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Create Bill Dialog — pramukh/admin only */}
      <Dialog open={showCreateBill} onOpenChange={setShowCreateBill}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Bill</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.key} onClick={() => setBillForm(f => ({ ...f, category: c.key }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${billForm.category === c.key ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input type="number" placeholder="e.g. 2000" value={billForm.amount} onChange={e => setBillForm(f => ({ ...f, amount: e.target.value }))} />
            </div>

            {/* Month/Year — maintenance only */}
            {billForm.category === 'maintenance' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={billForm.month} onChange={e => setBillForm(f => ({ ...f, month: e.target.value }))}>
                    {MONTHS_SHORT.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={billForm.year} onChange={e => setBillForm(f => ({ ...f, year: e.target.value }))} />
                </div>
              </div>
            )}

            {/* Due date */}
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" value={billForm.due_date} onChange={e => setBillForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description {billForm.category === 'special' ? '*' : '(optional)'}</Label>
              <Input placeholder="e.g. Monthly maintenance charges" value={billForm.description} onChange={e => setBillForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Penalty — maintenance only */}
            {billForm.category === 'maintenance' && (
              <div className="space-y-2">
                <Label>Late Penalty Amount (₹) — optional</Label>
                <Input type="number" placeholder="e.g. 100" value={billForm.penalty_amount} onChange={e => setBillForm(f => ({ ...f, penalty_amount: e.target.value }))} />
              </div>
            )}

            <Button className="w-full" disabled={creating} onClick={handleCreateBill}>
              {creating ? 'Creating...' : 'Create Bill & Notify Members'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
