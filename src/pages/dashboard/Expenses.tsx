import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../lib/apiClient';

interface ExpenseEntry {
  id: string;
  type: 'inflow' | 'outflow';
  amount: number;
  description: string;
  category?: string;
  date?: string;
  created_at: string;
  added_by_user?: { name: string };
}

interface FundSummary {
  current_balance: number;
  opening_balance?: number;
}

export default function Expenses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'outflow', amount: '', description: '', category: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  const canAdd = user?.role === 'pramukh' || user?.role === 'admin';

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<ExpenseEntry[]>('/expenses/entries'),
      api.get<FundSummary>('/expenses/summary'),
    ]).then(([e, s]) => {
      setEntries(e);
      setSummary(s);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!form.description.trim() || !form.amount) return;
    setSubmitting(true);
    try {
      await api.post('/expenses/entries', {
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description,
        category: form.category || undefined,
        date: form.date || undefined,
      });
      toast({ title: 'Entry added' });
      setShowForm(false);
      setForm({ type: 'outflow', amount: '', description: '', category: '', date: '' });
      fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Expenses & Fund"
        action={canAdd ? <Button size="sm" onClick={() => setShowForm(true)} className="gap-1"><Plus className="w-4 h-4" />Add</Button> : undefined}
      />

      {/* Fund summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-green-600 font-semibold mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-green-700">₹{Number(summary.current_balance).toLocaleString('en-IN')}</p>
          </div>
          {summary.opening_balance !== null && summary.opening_balance !== undefined && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
              <p className="text-xs text-blue-600 font-semibold mb-1">Opening Balance</p>
              <p className="text-2xl font-bold text-blue-700">₹{Number(summary.opening_balance).toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState icon={<Wallet className="w-12 h-12 text-gray-300" />} title="No entries yet" description="No fund entries have been recorded." />
      ) : (
        <div className="space-y-3">
          {entries.map(e => (
            <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${e.type === 'inflow' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {e.type === 'inflow'
                      ? <TrendingUp className="w-4 h-4 text-green-600" />
                      : <TrendingDown className="w-4 h-4 text-red-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{e.description}</p>
                    {e.category && <p className="text-xs text-gray-400">{e.category}</p>}
                    {e.added_by_user?.name && <p className="text-xs text-gray-400">By {e.added_by_user.name}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-lg ${e.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                    {e.type === 'inflow' ? '+' : '-'}₹{Number(e.amount).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.date || e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <Badge variant={e.type === 'inflow' ? 'default' : 'destructive'} className="text-xs mt-1">
                    {e.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Fund Entry</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="flex gap-2">
              {['outflow', 'inflow'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-xl border text-sm font-semibold capitalize transition-colors ${form.type === t ? (t === 'inflow' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'border-gray-200 text-gray-600'}`}>
                  {t === 'inflow' ? '↑ Inflow' : '↓ Outflow'}
                </button>
              ))}
            </div>
            <Input type="number" placeholder="Amount *" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <Textarea placeholder="Description *" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input placeholder="Category (optional)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Button className="w-full" disabled={submitting} onClick={handleAdd}>{submitting ? 'Adding...' : 'Add Entry'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
