import { useEffect, useMemo, useState } from 'react';
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

const RULE_CATEGORIES = [
  'General', 'Parking', 'Noise', 'Cleanliness', 'Security', 'Pets', 'Guests', 'Other',
] as const;

const CAT_COLORS: Record<string, string> = {
  General: '#3B5FC0',
  Parking: '#0D9488',
  Noise: '#D97706',
  Cleanliness: '#16A34A',
  Security: '#EF4444',
  Pets: '#EC4899',
  Guests: '#7C3AED',
  Other: '#6B7280',
};

const DESC_PREVIEW_LEN = 140;

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
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [detailRule, setDetailRule] = useState<SocietyRule | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<SocietyRule | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'General' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const canManage = user?.role === 'pramukh' || isAdmin;
  const canDelete = canManage;
  const hasActiveSub = subscription?.status === 'active' || isAdmin;

  const fetchRules = () => {
    if (needsBuilding) {
      setRules([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    api.get<SocietyRule[]>('/society-rules', buildingId ? { building_id: buildingId } : undefined)
      .then((data) => setRules(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setCategoryFilter('All');
    fetchRules();
  }, [buildingId, needsBuilding]);

  const filteredRules = useMemo(() => {
    if (categoryFilter === 'All') return rules;
    return rules.filter((r) => (r.category || 'General') === categoryFilter);
  }, [rules, categoryFilter]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const created = await api.post<SocietyRule>('/society-rules', {
        ...form,
        ...(buildingId ? { building_id: buildingId } : {}),
      });
      setRules((prev) =>
        [...prev, created].sort(
          (a, b) =>
            (a.order_index ?? 0) - (b.order_index ?? 0) ||
            String(a.created_at).localeCompare(String(b.created_at)),
        ),
      );
      toast({ title: 'Rule added' });
      setShowForm(false);
      setForm({ title: '', description: '', category: 'General' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editRule || !form.title.trim()) return;
    setSubmitting(true);
    try {
      const updated = await api.patch<SocietyRule>(`/society-rules/${editRule.id}`, form);
      setRules((prev) => prev.map((r) => (r.id === editRule.id ? { ...r, ...updated } : r)));
      setDetailRule((prev) => (prev?.id === editRule.id ? { ...prev, ...updated } : prev));
      toast({ title: 'Rule updated' });
      setEditRule(null);
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/society-rules/${deleteId}`);
      setRules((prev) => prev.filter((r) => r.id !== deleteId));
      if (detailRule?.id === deleteId) setDetailRule(null);
      toast({ title: 'Rule deleted' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
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
      ) : (
        <>
          <PageHeader
            title="Society Rules"
            action={
              canManage ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setForm({ title: '', description: '', category: 'General' });
                    setShowForm(true);
                  }}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  New
                </Button>
              ) : undefined
            }
          />

          {rules.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
              {['All', ...RULE_CATEGORIES].map((cat) => {
                const active = categoryFilter === cat;
                const color = cat === 'All' ? '#3B5FC0' : CAT_COLORS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                    style={
                      active
                        ? { backgroundColor: color, borderColor: color, color: '#fff' }
                        : { backgroundColor: '#fff', borderColor: '#E5E7EB', color: '#6B7280' }
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {filteredRules.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-12 h-12 text-gray-300" />}
              title={categoryFilter !== 'All' ? 'No rules in this category' : 'No rules defined'}
              description={
                categoryFilter !== 'All'
                  ? 'Try another filter or add a new rule.'
                  : 'Your society rules and guidelines will appear here.'
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredRules.map((r, i) => {
                const color = CAT_COLORS[r.category || 'General'] || CAT_COLORS.General;
                const desc = r.description?.trim() || '';
                const preview =
                  desc.length > DESC_PREVIEW_LEN
                    ? `${desc.slice(0, DESC_PREVIEW_LEN).trim()}…`
                    : desc;
                return (
                  <div
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetailRule(r)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setDetailRule(r);
                    }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:border-gray-200 transition-colors cursor-pointer"
                    style={{ borderLeftWidth: 4, borderLeftColor: color }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-sm"
                      style={{ backgroundColor: color + '18', color }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-base">{r.title}</p>
                      {preview && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">{preview}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: color + '18', color }}
                        >
                          {r.category || 'General'}
                        </span>
                        {r.updater?.name && (
                          <span className="text-[11px] text-gray-400 italic">
                            Updated by {r.updater.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              title: r.title,
                              description: r.description || '',
                              category: r.category || 'General',
                            });
                            setEditRule(r);
                          }}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteId(r.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Dialog
            open={showForm || !!editRule}
            onOpenChange={(o) => {
              if (!o) {
                setShowForm(false);
                setEditRule(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editRule ? 'Edit Rule' : 'New Rule'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <Input
                  placeholder="Rule Title *"
                  value={form.title}
                  maxLength={150}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Description"
                  rows={4}
                  value={form.description}
                  maxLength={2000}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
                <div className="flex flex-wrap gap-2">
                  {RULE_CATEGORIES.map((cat) => {
                    const active = form.category === cat;
                    const color = CAT_COLORS[cat];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, category: cat }))}
                        className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                        style={
                          active
                            ? { backgroundColor: color, borderColor: color, color: '#fff' }
                            : undefined
                        }
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <Button
                  className="w-full py-6 text-base shadow-lg"
                  disabled={submitting}
                  onClick={editRule ? handleEdit : handleAdd}
                >
                  {submitting ? 'Saving...' : editRule ? 'Save Changes' : 'Add Rule'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!detailRule} onOpenChange={(o) => !o && setDetailRule(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{detailRule?.title || 'Society Rule'}</DialogTitle>
              </DialogHeader>
              {detailRule && (
                <div className="space-y-3 mt-1">
                  <span
                    className="inline-block text-[11px] font-bold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: (CAT_COLORS[detailRule.category || 'General'] || CAT_COLORS.General) + '18',
                      color: CAT_COLORS[detailRule.category || 'General'] || CAT_COLORS.General,
                    }}
                  >
                    {detailRule.category || 'General'}
                  </span>
                  {detailRule.description ? (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {detailRule.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No description</p>
                  )}
                  <div className="text-xs text-gray-400 border-t pt-3 space-y-1">
                    <p>Updated by {detailRule.updater?.name || '—'}</p>
                    <p>
                      Last updated{' '}
                      {detailRule.updated_at || detailRule.created_at
                        ? new Date(detailRule.updated_at || detailRule.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <ConfirmDialog
            open={!!deleteId}
            onOpenChange={(o) => !o && setDeleteId(null)}
            title="Delete Rule?"
            description="Are you sure you want to delete this rule?"
            confirmLabel="Delete"
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  );
}
