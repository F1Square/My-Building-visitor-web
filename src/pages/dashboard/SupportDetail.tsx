import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import { Send } from 'lucide-react';
import api from '../../lib/apiClient';

interface Message {
  id: string;
  sender_id?: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  users?: { name: string; email: string; flat_no?: string; wing?: string };
  buildings?: { name: string };
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

export default function SupportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const backPath = isAdmin ? '/dashboard/admin/support' : '/dashboard/support';

  const fetchDetail = () => {
    if (!id) return;
    setLoading(true);
    api.get<{ ticket: Ticket; messages: Message[] }>(`/support-tickets/${id}`)
      .then(data => {
        setTicket(data.ticket);
        setMessages(data.messages || []);
      })
      .catch((e: Error) => {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const sendReply = async () => {
    if (!reply.trim() || !id) return;
    setSending(true);
    try {
      await api.post(`/support-tickets/${id}/messages`, { message: reply.trim() });
      setReply('');
      fetchDetail();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      await api.patch(`/support-tickets/${id}/status`, { status });
      fetchDetail();
      toast({ title: 'Status updated' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div><LoadingSkeleton rows={6} /></div>;
  if (!ticket) {
    return (
      <div>
        <PageHeader title="Support Ticket" showBack onBack={() => navigate(backPath)} />
        <p className="text-gray-500 text-center mt-8">Ticket not found</p>
      </div>
    );
  }

  const canReply = ticket.status !== 'closed';

  return (
    <div className="flex flex-col min-h-[70vh]">
      <PageHeader
        title={ticket.subject}
        subtitle={ticket.category}
        showBack
        onBack={() => navigate(backPath)}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={STATUS_VARIANTS[ticket.status] ?? 'outline'}>
          {STATUS_LABELS[ticket.status] ?? ticket.status}
        </Badge>
        {isAdmin && ticket.users && (
          <span className="text-sm text-gray-500">
            {ticket.users.name} · {ticket.users.email}
            {ticket.buildings?.name ? ` · ${ticket.buildings.name}` : ''}
          </span>
        )}
      </div>

      {isAdmin && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(['open', 'in_progress', 'resolved', 'closed'] as const).map(s => (
            <Button
              key={s}
              size="sm"
              variant={ticket.status === s ? 'default' : 'outline'}
              onClick={() => updateStatus(s)}
              disabled={updating}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-4 mb-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No messages yet</p>
        ) : (
          messages.map(m => {
            const isAdminMsg = m.sender_role === 'admin';
            return (
              <div
                key={m.id}
                className={`max-w-[85%] ${isAdminMsg ? 'mr-auto' : 'ml-auto'}`}
              >
                <p className="text-xs text-gray-400 mb-1">
                  {m.sender_name || m.sender_role} ·{' '}
                  {new Date(m.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAdminMsg
                      ? 'bg-white border border-gray-200 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {canReply ? (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 pb-2 flex gap-2 items-end">
          <Textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder={isAdmin ? 'Type admin reply...' : 'Type your reply...'}
            rows={2}
            className="flex-1 resize-none"
          />
          <Button onClick={sendReply} disabled={sending || !reply.trim()} size="icon" className="shrink-0 h-10 w-10">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4 border-t border-gray-100">
          This ticket is closed.{' '}
          <button type="button" className="text-blue-600 underline" onClick={() => navigate(backPath)}>
            Back to list
          </button>
        </p>
      )}
    </div>
  );
}
