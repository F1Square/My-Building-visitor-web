import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { HelpCircle, Plus, ChevronRight } from 'lucide-react';
import api from '../../lib/apiClient';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  last_message_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_VARIANTS: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  open: 'destructive',
  in_progress: 'default',
  resolved: 'secondary',
  closed: 'outline',
};

const CATEGORIES = ['General', 'Account', 'Billing', 'App Issue', 'Society Setup', 'Other'];

export default function Support() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', category: 'General' });

  const fetchTickets = () => {
    setLoading(true);
    api.get<Ticket[]>('/support-tickets/my')
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast({ title: 'Required', description: 'Subject and message are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/support-tickets', form);
      toast({ title: 'Submitted', description: 'we will reply soon.' });
      setShowForm(false);
      setForm({ subject: '', message: '', category: 'General' });
      fetchTickets();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div><LoadingSkeleton rows={4} /></div>;

  return (
    <div>
      <PageHeader
        title="Help & Support"
        subtitle="Ask questions"
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        }
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="w-12 h-12 text-gray-300" />}
          title="No support tickets yet"
          description="Tap New to ask a question"
        />
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/dashboard/support/${t.id}`)}
              className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 truncate">{t.subject}</p>
                  <Badge variant={STATUS_VARIANTS[t.status] ?? 'outline'} className="text-xs shrink-0">
                    {STATUS_LABELS[t.status] ?? t.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {t.category} · {new Date(t.last_message_at || t.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Support Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, category: c })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      form.category === c
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Subject *</p>
              <Input
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Message *</p>
              <Textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your issue or question..."
                rows={4}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
