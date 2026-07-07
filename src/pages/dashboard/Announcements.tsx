import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BuildingSelect, AdminBuildingPrompt } from '../../components/admin/BuildingSelect';
import { useAdminBuilding } from '../../hooks/useAdminBuilding';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { Megaphone, Plus } from 'lucide-react';
import api from '../../lib/apiClient';
import type { Announcement } from '../../types';

export default function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isAdmin,
    buildings,
    buildingsLoading,
    selectedBuilding,
    selectBuilding,
    buildingId,
    needsBuilding,
  } = useAdminBuilding();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal' });
  const [submitting, setSubmitting] = useState(false);

  const canPost = user?.role === 'pramukh' || user?.role === 'admin';

  const fetchAnnouncements = () => {
    if (needsBuilding) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }
    setLoading(true); setError('');
    api.get<Announcement[]>('/announcements', buildingId ? { building_id: buildingId } : undefined)
      .then(data => setAnnouncements(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnnouncements(); }, [buildingId, needsBuilding]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/announcements', { ...form, ...(buildingId ? { building_id: buildingId } : {}) });
      toast({ title: 'Posted', description: 'Announcement posted successfully' });
      setShowForm(false);
      setForm({ title: '', body: '', priority: 'normal' });
      fetchAnnouncements();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading && !needsBuilding) return <div><LoadingSkeleton /></div>;
  if (error && !needsBuilding) return <ErrorState message={error} onRetry={fetchAnnouncements} />;

  return (
    <div>
      {isAdmin && (
        <BuildingSelect className="mb-4" buildings={buildings} loading={buildingsLoading} value={selectedBuilding} onChange={selectBuilding} />
      )}
      {needsBuilding ? (
        <AdminBuildingPrompt />
      ) : (<>
      <PageHeader
        title="Announcements"
        action={canPost ? <Button size="sm" onClick={() => setShowForm(true)} className="gap-1"><Plus className="w-4 h-4" />New</Button> : undefined}
      />

      {announcements.length === 0 ? (
        <EmptyState icon={<Megaphone className="w-12 h-12 text-gray-300" />} title="No announcements yet" />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${a.priority === 'urgent' ? 'border-l-4 border-l-red-500' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{a.priority === 'urgent' ? '🚨' : '📢'}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.users?.name} · {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{a.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Message *" rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
            <div className="flex gap-2">
              {['normal', 'urgent'].map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${form.priority === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}>
                  {p === 'urgent' ? '🚨 Urgent' : '📢 Normal'}
                </button>
              ))}
            </div>
            <Button className="w-full" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </>)}
    </div>
  );
}
