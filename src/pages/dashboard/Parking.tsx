import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { Car, Plus, Trash2 } from 'lucide-react';
import api from '../../lib/apiClient';
import type { Vehicle } from '../../types';

export default function Parking() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ vehicle_number: '', type: '', owner_name: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = () => {
    setLoading(true);
    api.get<Vehicle[]>('/vehicles').then(setVehicles).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleAdd = async () => {
    if (!form.vehicle_number.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/vehicles', form);
      toast({ title: 'Vehicle added' });
      setShowForm(false);
      setForm({ vehicle_number: '', type: '', owner_name: '' });
      fetchVehicles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/vehicles/${deleteId}`);
      toast({ title: 'Vehicle removed' });
      fetchVehicles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setDeleteId(null); }
  };

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Parking" subtitle="Manage your vehicles"
        action={<Button size="sm" onClick={() => setShowForm(true)} className="gap-1"><Plus className="w-4 h-4" />Add</Button>}
      />
      {vehicles.length === 0 ? (
        <EmptyState icon={<Car className="w-12 h-12 text-gray-300" />} title="No vehicles registered" />
      ) : (
        <div className="space-y-3">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                <Car className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{v.vehicle_number}</p>
                <p className="text-sm text-gray-500">{v.type}{v.owner_name ? ` · ${v.owner_name}` : ''}</p>
              </div>
              <button onClick={() => setDeleteId(v.id)} className="text-red-400 hover:text-red-600 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Vehicle number *" value={form.vehicle_number} onChange={e => setForm(f => ({ ...f, vehicle_number: e.target.value }))} />
            <Input placeholder="Type (Car, Bike, etc.)" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
            <Input placeholder="Owner name" value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} />
            <Button className="w-full" disabled={submitting} onClick={handleAdd}>{submitting ? 'Adding...' : 'Add Vehicle'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}
        title="Remove vehicle?" description="This will remove the vehicle from your account."
        confirmLabel="Remove" onConfirm={handleDelete} />
    </div>
  );
}
