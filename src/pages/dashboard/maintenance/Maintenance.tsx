import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../components/ui/use-toast';
import { BuildingSelect, AdminBuildingPrompt } from '../../../components/admin/BuildingSelect';
import { useAdminBuilding } from '../../../hooks/useAdminBuilding';
import type { BuildingOption } from '../../../hooks/useBuildings';
import { Wrench, Droplets, Receipt, Plus, Wallet } from 'lucide-react';
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
  const {
    isAdmin,
    buildings,
    buildingsLoading,
    selectedBuilding,
    selectBuilding,
    buildingId,
    buildingName,
    needsBuilding,
  } = useAdminBuilding();

  const [loading, setLoading] = useState(!isAdmin);
  const [myBuilding, setMyBuilding] = useState<BuildingOption | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({ maintenance: 0, water_meter: 0, special: 0 });
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [billForm, setBillForm] = useState({
    category: 'maintenance', amount: '', month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()), due_date: '', description: '', penalty_amount: '',
  });
  const [creating, setCreating] = useState(false);

  const isPramukh = user?.role === 'pramukh';
  const isManager = isPramukh || isAdmin;

  const fetchCounts = useCallback(() => {
    if (needsBuilding) return;

    const params: Record<string, string | boolean> = isManager && !isAdmin
      ? {}
      : { mine: true };
    if (buildingId) params.building_id = buildingId;

    setLoading(true);
    api.get<PaymentRecord[]>('/maintenance/payments', params).then(data => {
      const c = { maintenance: 0, water_meter: 0, special: 0 };
      for (const p of data) {
        if (p.status === 'pending') {
          const cat = (p.category || p.maintenance_bills?.category || 'maintenance') as keyof typeof c;
          if (cat in c) c[cat]++;
        }
      }
      setCounts(c);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [needsBuilding, isManager, isAdmin, buildingId]);

  useEffect(() => {
    if (!isAdmin) {
      api.get<BuildingOption>('/buildings/my').then(setMyBuilding).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const activeBuilding = isAdmin ? selectedBuilding : myBuilding;

  const visibleCategories = CATEGORIES.filter(cat => {
    if (cat.key === 'water_meter') {
      if (!activeBuilding) return false;
      return activeBuilding.water_reading_enabled === true;
    }
    return true;
  });

  const categoryUrl = (key: string) => {
    const base = `/dashboard/maintenance/${key}`;
    if (isAdmin && selectedBuilding) {
      return `${base}?building_id=${selectedBuilding.id}&building_name=${encodeURIComponent(selectedBuilding.name)}`;
    }
    return base;
  };

  const handleCreateBill = async () => {
    if (!billForm.due_date) {
      toast({ title: 'Error', description: 'Due date is required', variant: 'destructive' });
      return;
    }
    if (isAdmin && !buildingId) {
      toast({ title: 'Error', description: 'Select a society first', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        category: billForm.category,
        due_date: billForm.due_date,
        description: billForm.description || undefined,
      };
      if (buildingId) payload.building_id = buildingId;
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
      fetchCounts();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setCreating(false); }
  };

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle={isAdmin && selectedBuilding ? selectedBuilding.name : isManager ? 'Manage billing categories' : 'Select a billing category'}
        action={
          isManager
            ? <Button size="sm" onClick={() => setShowCreateBill(true)} disabled={needsBuilding} className="gap-1"><Plus className="w-4 h-4" />Create Bill</Button>
            : <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/my-payments')} className="gap-1">
                <Wallet className="w-4 h-4" />My Payments
              </Button>
        }
      />

      {isAdmin && (
        <BuildingSelect
          className="mb-4"
          buildings={buildings}
          loading={buildingsLoading}
          value={selectedBuilding}
          onChange={selectBuilding}
        />
      )}

      {needsBuilding ? (
        <AdminBuildingPrompt />
      ) : loading ? (
        <div className="p-2"><LoadingSkeleton rows={3} /></div>
      ) : (
        <div className="space-y-4">
          {visibleCategories.map(cat => {
            const Icon = cat.icon;
            const pending = !isAdmin ? counts[cat.key] : 0;
            return (
              <button
                key={cat.key}
                onClick={() => navigate(categoryUrl(cat.key))}
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
      )}

      <Dialog open={showCreateBill} onOpenChange={setShowCreateBill}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Bill</DialogTitle></DialogHeader>
          {isAdmin && buildingName && (
            <p className="text-sm text-gray-500 -mt-2">Society: <span className="font-medium text-gray-800">{buildingName}</span></p>
          )}
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-3 gap-2">
                {visibleCategories.map(c => (
                  <button key={c.key} onClick={() => setBillForm(f => ({ ...f, category: c.key }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${billForm.category === c.key ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}>
                    {c.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input type="number" placeholder="e.g. 2000" value={billForm.amount} onChange={e => setBillForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
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
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" value={billForm.due_date} onChange={e => setBillForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description {billForm.category === 'special' ? '*' : '(optional)'}</Label>
              <Input placeholder="e.g. Monthly maintenance charges" value={billForm.description} onChange={e => setBillForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            {billForm.category === 'maintenance' && (
              <div className="space-y-2">
                <Label>Late Penalty Amount (₹) — optional</Label>
                <Input type="number" placeholder="e.g. 100" value={billForm.penalty_amount} onChange={e => setBillForm(f => ({ ...f, penalty_amount: e.target.value }))} />
              </div>
            )}
            <Button className="w-full" disabled={creating || needsBuilding} onClick={handleCreateBill}>
              {creating ? 'Creating...' : 'Create Bill & Notify Members'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
