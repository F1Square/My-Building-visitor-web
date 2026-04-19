import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { useToast } from '../../../components/ui/use-toast';
import { Tag, Plus, Trash2 } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { Promo } from '../../../types';

export default function Promos() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', discount_percent: '', expiry_date: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPromos = () => {
    setLoading(true);
    api.get<Promo[]>('/promos').then(setPromos).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleAdd = async () => {
    if (!form.code.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/promos', { ...form, discount_percent: parseFloat(form.discount_percent) });
      toast({ title: 'Promo created' });
      setShowForm(false);
      setForm({ code: '', discount_percent: '', expiry_date: '' });
      fetchPromos();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/promos/${deleteId}`);
      toast({ title: 'Promo deleted' });
      fetchPromos();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setDeleteId(null); }
  };

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Promo Codes"
        action={<Button size="sm" onClick={() => setShowForm(true)} className="gap-1"><Plus className="w-4 h-4" />Create</Button>}
      />
      {promos.length === 0 ? (
        <EmptyState icon={<Tag className="w-12 h-12 text-gray-300" />} title="No promo codes" />
      ) : (
        <div className="space-y-3">
          {promos.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-gray-900 font-mono">{p.code}</p>
                <p className="text-sm text-gray-500">{p.discount_percent ?? p.discount}% off</p>
                {(p.expiry_date || p.expires_at) && (
                  <p className="text-xs text-gray-400">Expires: {new Date(p.expiry_date || p.expires_at!).toLocaleDateString('en-IN')}</p>
                )}
                {p.usage_count !== undefined && <p className="text-xs text-gray-400">Used: {p.usage_count} times</p>}
              </div>
              <button onClick={() => setDeleteId(p.id)} className="text-red-400 hover:text-red-600 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Promo Code</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Code *" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
            <Input type="number" placeholder="Discount %" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} />
            <Input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
            <Button className="w-full" disabled={submitting} onClick={handleAdd}>{submitting ? 'Creating...' : 'Create Promo'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}
        title="Delete promo?" confirmLabel="Delete" onConfirm={handleDelete} />
    </div>
  );
}
