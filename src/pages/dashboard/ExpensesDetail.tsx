import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { DatePicker } from '../../components/ui/date-picker';
import { useToast } from '../../components/ui/use-toast';
import { Wallet, Plus, TrendingUp, TrendingDown, Edit2, Trash2, Download, Settings, ArrowLeft } from 'lucide-react';
import api from '../../lib/apiClient';
import {
  entryMatchesMonthYear,
  formatExpenseDate,
  localDateString,
  parseExpenseDateParts,
} from '../../lib/dateUtils';

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

export default function ExpensesDetail() {
  const navigate = useNavigate();
  const { wing: wingParam } = useParams<{ wing: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const wingName = decodeURIComponent(wingParam || 'Building-Wide');
  const isAdmin = user?.role === 'admin';
  const buildingId = isAdmin ? searchParams.get('building_id') ?? undefined : user?.building_id ?? undefined;
  const buildingName = searchParams.get('building_name') ?? undefined;

  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<ExpenseEntry | null>(null);
  const [form, setForm] = useState({ type: 'outflow', amount: '', description: '', category: '', date: localDateString() });
  const [submitting, setSubmitting] = useState(false);

  const [showSetBalance, setShowSetBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const isPramukh = user?.role === 'pramukh';
  const canManage = isPramukh || isAdmin;

  const scopeParams = { building_id: buildingId, wing: wingName };

  const backUrl = isAdmin && buildingId
    ? `/dashboard/expenses?building_id=${buildingId}&building_name=${encodeURIComponent(buildingName || '')}`
    : '/dashboard/expenses';

  const fetchData = () => {
    if (!buildingId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.get<ExpenseEntry[]>('/expenses/entries', scopeParams),
      api.get<FundSummary>('/expenses/summary', scopeParams),
    ]).then(([e, s]) => {
      setEntries(e);
      setSummary(s);
      if (isPramukh && (s.opening_balance === null || s.opening_balance === undefined)) {
        setShowSetBalance(true);
      }
    }).catch((err: Error) => {
      toast({ title: 'Could not load expenses', description: err.message, variant: 'destructive' });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [buildingId, wingName]);

  const handleAdd = async () => {
    if (!form.description.trim() || !form.amount || !buildingId) return;
    setSubmitting(true);
    try {
      await api.post('/expenses/entries', {
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description,
        category: form.category || undefined,
        date: form.date || localDateString(),
        building_id: buildingId,
        wing: wingName,
      });
      const parts = parseExpenseDateParts(form.date, localDateString());
      if (parts) {
        setSelectedMonth(parts.month);
        setSelectedYear(parts.year);
      }
      toast({ title: 'Entry added' });
      setShowForm(false);
      setForm({ type: 'outflow', amount: '', description: '', category: '', date: localDateString() });
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
        wing: wingName,
        building_id: buildingId,
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
    if (isNaN(val) || val < 0 || !buildingId) return toast({ title: 'Invalid amount', variant: 'destructive' });
    setSubmitting(true);
    try {
      await api.post('/expenses/opening-balance', { amount: val, building_id: buildingId, wing: wingName });
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
      const date = formatExpenseDate(e.date, e.created_at);
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
    a.download = `expenses-${wingName.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (typeFilter !== 'all') result = result.filter(e => e.type === typeFilter);
    result = result.filter(e =>
      entryMatchesMonthYear(e.date, e.created_at, selectedMonth, selectedYear),
    );
    return result;
  }, [entries, typeFilter, selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    const inflow = filteredEntries.filter(e => e.type === 'inflow').reduce((s, e) => s + Number(e.amount), 0);
    const outflow = filteredEntries.filter(e => e.type === 'outflow').reduce((s, e) => s + Number(e.amount), 0);
    return { inflow, outflow };
  }, [filteredEntries]);

  if (isAdmin && !buildingId) {
    return (
      <div>
        <PageHeader title="Expenses & Fund" />
        <EmptyState icon={<Wallet className="w-12 h-12 text-gray-300" />} title="Building not selected" description="Go back and select a society first." />
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/expenses')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to wings
        </Button>
      </div>
    );
  }

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader
        title={`Wing ${wingName}`}
        subtitle={isAdmin && buildingName ? buildingName : 'Expenses & fund'}
        showBack
        onBack={() => navigate(backUrl)}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(backUrl)} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Wings
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCSV} className="gap-1">
              <Download className="w-4 h-4" /> CSV
            </Button>
            {canManage && (
              <Button size="sm" onClick={() => {
                setForm({ type: 'outflow', amount: '', description: '', category: '', date: localDateString() });
                setShowForm(true);
              }} className="gap-1"><Plus className="w-4 h-4" />Add</Button>
            )}
          </div>
        }
      />

      {summary && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
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

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <select
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white font-medium"
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select
            className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white font-medium"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
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
                        {formatExpenseDate(e.date, e.created_at)}
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
                        setForm({ type: e.type, amount: String(e.amount), description: e.description, category: e.category || '', date: (e.date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0]) || localDateString() });
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

      <Dialog open={showForm || !!editEntry} onOpenChange={o => {
        if (!o) { setShowForm(false); setEditEntry(null); }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editEntry ? 'Edit Fund Entry' : 'Add Fund Entry'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-2">
              {['outflow', 'inflow'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
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
              <DatePicker
                value={form.date}
                onChange={date => setForm(f => ({ ...f, date }))}
                placeholder="Select date"
              />
            </div>
            <Button className="w-full py-6 text-base shadow-lg" disabled={submitting} onClick={editEntry ? handleEdit : handleAdd}>
              {submitting ? 'Saving...' : editEntry ? 'Save Changes' : 'Add Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSetBalance} onOpenChange={setShowSetBalance}>
        <DialogContent>
          <DialogHeader><DialogTitle>{summary?.opening_balance !== null ? 'Update Opening Balance' : 'Set Current Balance'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-gray-500 mb-2">
              Enter the current amount for wing <strong>{wingName}</strong>. This will be your starting point.
            </p>
            <Input type="number" placeholder="Current Balance (₹) *" value={balanceInput} onChange={e => setBalanceInput(e.target.value)} className="text-xl font-bold" />
            <Button className="w-full mt-2" disabled={submitting} onClick={handleSetBalance}>
              {submitting ? 'Saving...' : 'Save Balance'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
