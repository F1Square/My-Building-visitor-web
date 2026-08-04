import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { RecordDetailRows } from '../../../components/ui/RecordDetailRows';
import { Building2, Plus, X } from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import api from '../../../lib/apiClient';
import type { Building } from '../../../types';

export default function AdminBuildings() {
  const { toast } = useToast();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<Building | null>(null);

  // New building form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [hasWings, setHasWings] = useState(false);
  const [lateFeesEnabled, setLateFeesEnabled] = useState(false);
  const [lateFeesAmount, setLateFeesAmount] = useState('');
  const [waterReadingEnabled, setWaterReadingEnabled] = useState(false);

  // Payment methods
  const [payCash, setPayCash] = useState(false);
  const [payOnline, setPayOnline] = useState(true);
  const [payCheque, setPayCheque] = useState(false);

  const fetchBuildings = () => {
    setLoading(true);
    api.get<Building[]>('/buildings')
      .then(setBuildings)
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return toast({ title: 'Building name is required', variant: 'destructive' });

    setCreating(true);
    try {
      const payment_methods = [];
      if (payCash) payment_methods.push('Cash');
      if (payOnline) payment_methods.push('Online');
      if (payCheque) payment_methods.push('Cheque');

      await api.post('/buildings/create', {
        name,
        address,
        city,
        state,
        has_wings: hasWings,
        late_fees_enabled: lateFeesEnabled,
        late_fees_amount: lateFeesEnabled ? Number(lateFeesAmount) : null,
        water_reading_enabled: waterReadingEnabled,
        payment_methods
      });

      toast({ title: 'Building created successfully' });
      setShowCreateModal(false);
      setName('');
      setAddress('');
      setCity('');
      setState('');
      setHasWings(false);
      setLateFeesEnabled(false);
      setLateFeesAmount('');
      setWaterReadingEnabled(false);
      setPayCash(false);
      setPayOnline(true);
      setPayCheque(false);
      fetchBuildings();
    } catch (e: unknown) {
      toast({ title: 'Failed to create building', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="Buildings" subtitle={`${buildings.length} registered`} />
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Building
        </Button>
      </div>

      {buildings.length === 0 ? (
        <EmptyState icon={<Building2 className="w-12 h-12 text-gray-300" />} title="No buildings" />
      ) : (
        <div className="space-y-3">
          {buildings.map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => setDetail(b)}
              className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900">{b.name}</p>
                  <p className="text-sm text-gray-500">{b.city}{b.state ? `, ${b.state}` : ''}</p>
                  {b.pramukh_name && <p className="text-xs text-gray-400 mt-0.5">Pramukh: {b.pramukh_name}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {b.subscription_status && (
                    <Badge variant={b.subscription_status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {b.subscription_status}
                    </Badge>
                  )}
                  {b.member_count !== undefined && <p className="text-xs text-gray-400">{b.member_count} members</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.name || 'Building'}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 mt-1">
              {detail.subscription_status ? (
                <Badge variant={detail.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {detail.subscription_status}
                </Badge>
              ) : null}
              <RecordDetailRows
                rows={[
                  ['Address', detail.address],
                  ['City', detail.city],
                  ['State', detail.state],
                  ['Pramukh', detail.pramukh_name],
                  ['Members', detail.member_count],
                  ['Wings enabled', detail.has_wings == null ? null : detail.has_wings ? 'Yes' : 'No'],
                  ['Late fees', detail.late_fees_enabled ? (detail.late_fees_amount != null ? `₹${detail.late_fees_amount}` : 'Enabled') : 'No'],
                  ['Water reading', detail.water_reading_enabled == null ? null : detail.water_reading_enabled ? 'Yes' : 'No'],
                  ['Payment methods', detail.payment_method],
                  ['Payment T&C', detail.payment_tc],
                  ['Created', detail.created_at ? new Date(detail.created_at).toLocaleString('en-IN') : null],
                ]}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Building Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold">Create New Building</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <Label>Building Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunshine Apartments" />
              </div>

              <div className="space-y-2">
                <Label>Address (Optional)</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Surat" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Gujarat" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Enable Wings</Label>
                  <p className="text-xs text-gray-500">Allow members to select wings (A, B, C, etc.)</p>
                </div>
                <Switch checked={hasWings} onCheckedChange={setHasWings} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Enable Late Fees</Label>
                  <p className="text-xs text-gray-500">Apply late fees on overdue maintenance</p>
                </div>
                <Switch checked={lateFeesEnabled} onCheckedChange={setLateFeesEnabled} />
              </div>

              {lateFeesEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  <Label>Late Fee Amount (₹)</Label>
                  <Input type="number" value={lateFeesAmount} onChange={e => setLateFeesAmount(e.target.value)} placeholder="e.g. 50" />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Enable Water Reading Bills</Label>
                  <p className="text-xs text-gray-500">Show separate water reading section in maintenance</p>
                </div>
                <Switch checked={waterReadingEnabled} onCheckedChange={setWaterReadingEnabled} />
              </div>

              <div className="pt-3 border-t border-gray-100">
                <Label className="mb-3 block">Supported Payment Methods</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={payCash} onChange={e => setPayCash(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={payOnline} onChange={e => setPayOnline(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">Online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={payCheque} onChange={e => setPayCheque(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">Cheque</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Cash and Cheque payments require Pramukh approval to generate a receipt.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Building'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
