import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { AlertCircle, Plus } from 'lucide-react';
import api from '../../lib/apiClient';
import type { Complaint } from '../../types';

const STATUSES = ['open', 'in_progress', 'resolved'] as const;
const STATUS_LABELS: Record<string, string> = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' };
const STATUS_COLORS: Record<string, 'destructive' | 'default' | 'secondary'> = { open: 'destructive', in_progress: 'default', resolved: 'secondary' };

export default function Complaints() {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Complaint | null>(null);
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const hasActiveSub = subscription?.status === 'active' || user?.role === 'admin' || user?.role === 'pramukh';

  const fetchComplaints = () => {
    setLoading(true);
    const endpoint = user?.role === 'user' ? '/complaints/building' : '/complaints/my';
    api.get<Complaint[]>(endpoint).then(setComplaints).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/complaints', form);
      toast({ title: 'Complaint submitted' });
      setShowForm(false);
      setForm({ title: '', category: '', description: '' });
      fetchComplaints();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (!hasActiveSub) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle className="w-14 h-14 text-amber-400" />
        <h2 className="text-xl font-bold text-gray-900">Subscription Required</h2>
        <p className="text-gray-500 max-w-sm">The Complaints module requires an active subscription.</p>
        <Button onClick={() => window.location.href = '/dashboard/subscribe'}>View Plans</Button>
      </div>
    );
  }

  if (loading) return <div><LoadingSkeleton /></div>;

  const byStatus = (status: string) => complaints.filter(c => c.status === status);

  return (
    <div>
      <PageHeader title="Complaints"
        action={<Button size="sm" onClick={() => setShowForm(true)} className="gap-1"><Plus className="w-4 h-4" />New</Button>}
      />

      <Tabs defaultValue="open">
        <TabsList className="mb-4">
          {STATUSES.map(s => (
            <TabsTrigger key={s} value={s}>
              {STATUS_LABELS[s]} {byStatus(s).length > 0 && <span className="ml-1.5 bg-gray-200 text-gray-700 text-xs rounded-full px-1.5">{byStatus(s).length}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
        {STATUSES.map(s => (
          <TabsContent key={s} value={s}>
            {byStatus(s).length === 0 ? (
              <EmptyState icon={<AlertCircle className="w-10 h-10 text-gray-300" />} title={`No ${STATUS_LABELS[s].toLowerCase()} complaints`} />
            ) : (
              <div className="space-y-3">
                {byStatus(s).map(c => (
                  <button key={c.id} onClick={() => setDetail(c)} className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900">{c.title}</p>
                      <Badge variant={STATUS_COLORS[c.status]}>{STATUS_LABELS[c.status]}</Badge>
                    </div>
                    {c.category && <p className="text-xs text-gray-400 mt-1">{c.category}</p>}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.description}</p>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* New complaint form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Complaint</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input placeholder="Category (e.g. Water, Electricity)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <Textarea placeholder="Description" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Button className="w-full" disabled={submitting} onClick={handleSubmit}>{submitting ? 'Submitting...' : 'Submit Complaint'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{detail?.title}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 mt-2">
              {detail.photo_url && <img src={detail.photo_url} alt="complaint" className="w-full h-40 object-cover rounded-xl" />}
              <Badge variant={STATUS_COLORS[detail.status]}>{STATUS_LABELS[detail.status]}</Badge>
              {detail.category && <p className="text-sm text-gray-500">{detail.category}</p>}
              <p className="text-sm text-gray-700">{detail.description}</p>
              {detail.pramukh_remark && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Pramukh Remark</p>
                  <p className="text-sm text-blue-900">{detail.pramukh_remark}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
