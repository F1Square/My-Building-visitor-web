import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { Wallet, Plus, TrendingUp, TrendingDown, Edit2, Trash2, Download, Settings } from 'lucide-react';
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
  is_edited?: boolean;
}

interface FundSummary {
  current_balance: number;
  opening_balance?: number | null;
}

const CATEGORIES = ['Maintenance', 'Salary', 'Repair', 'Cleaning', 'Security', 'Utilities', 'Event', 'Other'];

export default function Expenses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<ExpenseEntry | null>(null);
  const [form, setForm] = useState({ type: 'outflow', amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10) });
  const [submitting, setSubmitting] = useState(false);
  
  const [showSetBalance, setShowSetBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [timeFilter, setTimeFilter] = useState<'all' | 'monthly' | 'quarterly' | 'yearly'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  const isAdmin = user?.role === 'admin';
  const isPramukh = user?.role === 'pramukh';
  const canManage = isPramukh || isAdmin;

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<ExpenseEntry[]>('/expenses/entries'),
      api.get<FundSummary>('/expenses/summary'),
    ]).then(([e, s]) => {
      setEntries(e);
      setSummary(s);
      if (isPramukh && (s.opening_balance === null || s.opening_balance === undefined)) {
        setShowSetBalance(true);
      }
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
      setForm({ type: 'outflow', amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10) });
      fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editEntry || !form.description.trim() || !form.amount) return;
    setSubmitting(true);
    try {
      await api.patch(`/expenses/entries/${editEntry.id}`, {
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description,
        category: form.category || undefined,
        date: form.date || undefined,
      });
      toast({ title: 'Entry updated' });
      setEditEntry(null);
      fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/expenses/entries/${deleteId}`);
      toast({ title: 'Entry deleted' });
      fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setDeleteId(null); }
  };

  const handleSetBalance = async () => {
    const val = parseFloat(balanceInput);
    if (isNaN(val) || val < 0) return toast({ title: 'Invalid amount', variant: 'destructive' });
    setSubmitting(true);
    try {
      await api.post('/expenses/opening-balance', { amount: val });
      toast({ title: 'Opening balance set' });
      setShowSetBalance(false);
      fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const downloadCSV = () => {
    const header = 'Date,Type,Category,Description,Amount,Added By\n';
    const rows = filteredEntries.map(e => {
      const date = new Date(e.date || e.created_at).toLocaleDateString();
      const type = e.type === 'inflow' ? 'Inflow' : 'Outflow';
      const category = e.category || '';
      const desc = `"${(e.description || '').replace(/"/g, '""')}"`;
      const amount = e.amount;
      const by = e.added_by_user?.name || '';
      return `${date},${type},${category},${desc},${amount},${by}`;
    }).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (typeFilter !== 'all') result = result.filter(e => e.type === typeFilter);
    const now = new Date();
    if (timeFilter === 'monthly') {
      result = result.filter(e => {
        const d = new Date(e.date || e.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (timeFilter === 'quarterly') {
      result = result.filter(e => {
        const d = new Date(e.date || e.created_at);
        return Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3) && d.getFullYear() === now.getFullYear();
      });
    } else if (timeFilter === 'yearly') {
      result = result.filter(e => {
        const d = new Date(e.date || e.created_at);
        return d.getFullYear() === now.getFullYear();
      });
    }
    return result;
  }, [entries, typeFilter, timeFilter]);

  const totals = useMemo(() => {
    const inflow = filteredEntries.filter(e => e.type === 'inflow').reduce((s, e) => s + Number(e.amount), 0);
    const outflow = filteredEntries.filter(e => e.type === 'outflow').reduce((s, e) => s + Number(e.amount), 0);
    return { inflow, outflow };
  }, [filteredEntries]);

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Expenses & Fund"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={downloadCSV} className="gap-1 bg-white hover:bg-gray-50 border-gray-200">
              <Download className="w-4 h-4" /> CSV
            </Button>
            {canManage && (
              <Button size="sm" onClick={() => {
                setForm({ type: 'outflow', amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10) });
                setShowForm(true);
              }} className="gap-1"><Plus className="w-4 h-4" />Add</Button>
            )}
          </div>
        }
      />

      {/* Fund summary */}
      {summary && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Current Balance</p>
              <p className="text-3xl font-black text-gray-900">₹{Number(summary.current_balance).toLocaleString('en-IN')}</p>
              {summary.opening_balance !== null && summary.opening_balance !== undefined && (
                <p className="text-xs text-gray-400 mt-1">Opening: ₹{Number(summary.opening_balance).toLocaleString('en-IN')}</p>
              )}
            </div>
            
            <div className="flex gap-4 col-span-1 md:col-span-2 items-center justify-center md:justify-end">
              <div className="bg-green-50 rounded-xl p-3 px-4 flex items-center gap-3 border border-green-100">
                <div className="bg-green-100 rounded-full p-2"><TrendingUp className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-xs text-green-700 font-medium">Inflow</p>
                  <p className="text-lg font-bold text-green-700">₹{Number(totals.inflow).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 px-4 flex items-center gap-3 border border-red-100">
                <div className="bg-red-100 rounded-full p-2"><TrendingDown className="w-5 h-5 text-red-600" /></div>
                <div>
                  <p className="text-xs text-red-700 font-medium">Outflow</p>
                  <p className="text-lg font-bold text-red-700">₹{Number(totals.outflow).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
          
          {canManage && (
            <button onClick={() => {
              setBalanceInput(String(summary.opening_balance || ''));
              setShowSetBalance(true);
            }} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors" title="Update Opening Balance">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['all', 'monthly', 'quarterly', 'yearly'] as const).map(t => (
            <button key={t} onClick={() => setTimeFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeFilter === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'all' ? 'All Time' : t === 'monthly' ? 'This Month' : t === 'quarterly' ? 'This Qtr' : 'This Year'}
            </button>
          ))}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['all', 'inflow', 'outflow'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${typeFilter === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'all' ? 'All Types' : t === 'inflow' ? '↓ Inflow' : '↑ Outflow'}
            </button>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <EmptyState icon={<Wallet className="w-12 h-12 text-gray-300" />} title="No entries found" description="Adjust your filters or add a new entry." />
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(e => (
            <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${e.type === 'inflow' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {e.type === 'inflow'
                      ? <TrendingUp className="w-5 h-5 text-green-600" />
                      : <TrendingDown className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{e.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {e.category && <Badge variant="secondary" className="text-[10px] py-0">{e.category}</Badge>}
                      <p className="text-xs text-gray-500">
                        {new Date(e.date || e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {e.added_by_user?.name && <p className="text-xs text-gray-400 border-l border-gray-200 pl-2">By {e.added_by_user.name}</p>}
                      {e.is_edited && <Badge variant="outline" className="text-[10px] py-0 text-purple-600 border-purple-200 bg-purple-50">Edited</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className={`font-black text-lg ${e.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                    {e.type === 'inflow' ? '+' : '-'}₹{Number(e.amount).toLocaleString('en-IN')}
                  </p>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => {
                        setForm({ type: e.type, amount: String(e.amount), description: e.description, category: e.category || '', date: e.date || new Date().toISOString().slice(0, 10) });
                        setEditEntry(e);
                      }} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => setDeleteId(e.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Entry Dialog */}
      <Dialog open={showForm || !!editEntry} onOpenChange={o => {
        if (!o) { setShowForm(false); setEditEntry(null); }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editEntry ? 'Edit Fund Entry' : 'Add Fund Entry'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-2">
              {['outflow', 'inflow'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t as any }))}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-bold capitalize transition-colors ${form.type === t ? (t === 'inflow' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-red-600 text-white border-red-600 shadow-md') : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                  {t === 'inflow' ? '↑ Inflow' : '↓ Outflow'}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Amount (₹) *</label>
              <Input type="number" placeholder="e.g. 5000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="text-lg font-semibold" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Description *</label>
              <Textarea placeholder="e.g. Monthly maintenance" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {CATEGORIES.map(c => (
                  <button key={c} type="button"
                    onClick={() => setForm(f => ({ ...f, category: f.category === c ? '' : c }))}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${form.category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <Input placeholder="Custom Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <Button className="w-full py-6 text-base shadow-lg" disabled={submitting} onClick={editEntry ? handleEdit : handleAdd}>
              {submitting ? 'Saving...' : editEntry ? 'Save Changes' : 'Add Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Opening Balance Dialog */}
      <Dialog open={showSetBalance} onOpenChange={setShowSetBalance}>
        <DialogContent>
          <DialogHeader><DialogTitle>{summary?.opening_balance !== null ? 'Update Opening Balance' : 'Set Current Balance'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-gray-500 mb-2">
              Enter the current amount your society holds right now. This will be your starting point.
            </p>
            <Input type="number" placeholder="Current Balance (₹) *" value={balanceInput} onChange={e => setBalanceInput(e.target.value)} className="text-xl font-bold" />
            <Button className="w-full mt-2" disabled={submitting} onClick={handleSetBalance}>
              {submitting ? 'Saving...' : 'Save Balance'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Delete Entry?"
        description="Are you sure you want to delete this expense entry? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}

