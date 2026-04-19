import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import api from '../../lib/apiClient';
import type { SocietyRule } from '../../types';

export default function SocietyRules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<SocietyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'pramukh' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  const fetchRules = () => {
    setLoading(true); setError('');
    api.get<SocietyRule[]>('/society-rules').then(setRules).catch(e => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRules(); }, []);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/society-rules', form);
      toast({ title: 'Rule added' });
      setShowForm(false);
      setForm({ title: '', description: '' });
      fetchRules();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/society-rules/${deleteId}`);
      toast({ title: 'Rule removed' });
      fetchRules();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setDeleteId(null); }
  };

  if (loading) return <div><LoadingSkeleton /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchRules} />;

  return (
    <div>
      <PageHeader title="Society Rules"
        action={canManage ? <Button size="sm" onClick={() => setShowForm(true)} className="gap-1"><Plus className="w-4 h-4" />Add</Button> : undefined}
      />
      {rules.length === 0 ? (
        <EmptyState icon={<BookOpen className="w-12 h-12 text-gray-300" />} title="No rules defined" />
      ) : (
        <div className="space-y-3">
          {rules.map((r, i) => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                {r.rule_number ?? i + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{r.title}</p>
                {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
              </div>
              {canDelete && (
                <button onClick={() => setDeleteId(r.id)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Rule</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Rule title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Button className="w-full" disabled={submitting} onClick={handleAdd}>{submitting ? 'Adding...' : 'Add Rule'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}
        title="Remove rule?" confirmLabel="Remove" onConfirm={handleDelete} />
    </div>
  );
}
