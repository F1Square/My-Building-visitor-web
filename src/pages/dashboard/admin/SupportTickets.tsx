import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { HelpCircle, ChevronRight } from 'lucide-react';
import api from '../../../lib/apiClient';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  last_message_at: string | null;
  created_at: string;
  users?: { name: string; email: string };
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

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export default function SupportTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTickets = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filter !== 'all') params.status = filter;
    if (search.trim()) params.search = search.trim();
    api.get<Ticket[]>('/support-tickets/admin', params)
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const openCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div>
      <PageHeader
        title="Help & Support"
        subtitle={openCount > 0 ? `${openCount} open ticket${openCount === 1 ? '' : 's'}` : `${tickets.length} total`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by subject, user, email..."
          className="flex-1"
          onKeyDown={e => { if (e.key === 'Enter') fetchTickets(); }}
        />
        <Button variant="outline" onClick={fetchTickets}>Search</Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="w-12 h-12 text-gray-300" />}
          title="No support tickets"
        />
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/dashboard/support/${t.id}`)}
              className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm border transition-all flex items-center gap-3 hover:shadow-md ${
                t.status === 'open' ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 truncate">{t.subject}</p>
                  <Badge variant={STATUS_VARIANTS[t.status] ?? 'outline'} className="text-xs shrink-0">
                    {STATUS_LABELS[t.status] ?? t.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{t.users?.name || 'Unknown'} · {t.users?.email}</p>
                {t.buildings?.name && <p className="text-xs text-gray-500">{t.buildings.name}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {t.category} · {new Date(t.last_message_at || t.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
