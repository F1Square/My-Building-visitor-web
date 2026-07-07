import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BuildingSelect, AdminBuildingPrompt } from '../../components/admin/BuildingSelect';
import { useAdminBuilding } from '../../hooks/useAdminBuilding';
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
import { BookOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import api from '../../lib/apiClient';
import type { SocietyRule } from '../../types';

export default function SocietyRules() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const {
    isAdmin: isAdminRole,
    buildings,
    buildingsLoading,
    selectedBuilding,
    selectBuilding,
    buildingId,
    needsBuilding,
  } = useAdminBuilding();
  const [rules, setRules] = useState<SocietyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<SocietyRule | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const canManage = user?.role === 'pramukh' || isAdmin;
  const canDelete = isAdmin;
  const hasActiveSub = subscription?.status === 'active' || isAdmin;

  const fetchRules = () => {
    if (needsBuilding) {
      setRules([]);
      setLoading(false);
      return;
    }
    setLoading(true); setError('');
    api.get<SocietyRule[]>('/society-rules', buildingId ? { building_id: buildingId } : undefined)
      .then(setRules)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRules(); }, [buildingId, needsBuilding]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/society-rules', { ...form, ...(buildingId ? { building_id: buildingId } : {}) });
      toast({ title: 'Rule added' });
      setShowForm(false);
      setForm({ title: '', description: '' });
      fetchRules();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editRule || !form.title.trim()) return;
    setSubmitting(true);
    try {
      await api.patch(`/society-rules/${editRule.id}`, form);
      toast({ title: 'Rule updated' });
      setEditRule(null);
      fetchRules();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/society-rules/${deleteId}`);
      toast({ title: 'Rule deleted' });
      fetchRules();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setDeleteId(null); }
  };

  if (!hasActiveSub) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <BookOpen className="w-14 h-14 text-amber-400" />
        <h2 className="text-xl font-bold text-gray-900">Subscription Required</h2>
        <p className="text-gray-500 max-w-sm">The Society Rules module requires an active subscription.</p>
        <Button onClick={() => navigate('/dashboard/subscribe')}>View Plans</Button>
      </div>
    );
  }

  if (loading && !needsBuilding) return <div><LoadingSkeleton /></div>;
  if (error && !needsBuilding) return <ErrorState message={error} onRetry={fetchRules} />;

  return (
    <div>
      {isAdminRole && (
        <BuildingSelect className="mb-4" buildings={buildings} loading={buildingsLoading} value={selectedBuilding} onChange={selectBuilding} />
      )}
      {needsBuilding ? (
        <AdminBuildingPrompt />
      ) : (<>
      <PageHeader title="Society Rules"
        action={canManage ? <Button size="sm" onClick={() => {
          setForm({ title: '', description: '' });
          setShowForm(true);
        }} className="gap-1"><Plus className="w-4 h-4" />New</Button> : undefined}
      />

      {rules.length === 0 ? (
        <EmptyState icon={<BookOpen className="w-12 h-12 text-gray-300" />} title="No rules defined" description="Your society rules and guidelines will appear here." />
      ) : (
        <div className="space-y-3">
          {rules.map((r, i) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:border-gray-200 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-base">{r.title}</p>
                {r.description && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.description}</p>}
              </div>
              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => {
                    setForm({ title: r.title, description: r.description || '' });
                    setEditRule(r);
                  }} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {canDelete && (
                    <button onClick={() => setDeleteId(r.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm || !!editRule} onOpenChange={o => {
        if (!o) { setShowForm(false); setEditRule(null); }
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editRule ? 'Edit Rule' : 'New Rule'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Rule Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Button className="w-full py-6 text-base shadow-lg" disabled={submitting} onClick={editRule ? handleEdit : handleAdd}>
              {submitting ? 'Saving...' : editRule ? 'Save Changes' : 'Add Rule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Delete Rule?"
        description="Are you sure you want to delete this rule?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
      </>)}
    </div>
  );
}
