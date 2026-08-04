import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { RecordDetailRows } from '../../../components/ui/RecordDetailRows';
import { useToast } from '../../../components/ui/use-toast';
import { Mail, Phone } from 'lucide-react';
import api from '../../../lib/apiClient';
import type { WebsiteContact } from '../../../types';

const STATUS_VARIANT: Record<WebsiteContact['status'], 'default' | 'secondary' | 'outline'> = {
  new: 'default',
  read: 'secondary',
  replied: 'outline',
};

export default function WebsiteContacts() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<WebsiteContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<WebsiteContact | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchContacts = useCallback(() => {
    setLoading(true);
    api
      .get<WebsiteContact[]>('/contacts')
      .then(setContacts)
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const updateStatus = async (id: string, status: WebsiteContact['status']) => {
    setUpdating(true);
    try {
      await api.patch(`/contacts/${id}/status`, { status });
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      setDetail((prev) => (prev?.id === id ? { ...prev, status } : prev));
      toast({ title: `Marked as ${status}` });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const openDetail = (item: WebsiteContact) => {
    setDetail(item);
    if (item.status === 'new') updateStatus(item.id, 'read');
  };

  const newCount = contacts.filter((c) => c.status === 'new').length;

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader
        title="Website Contacts"
        subtitle={`${contacts.length} total${newCount ? ` · ${newCount} new` : ''}`}
      />
      {contacts.length === 0 ? (
        <EmptyState icon={<Mail className="w-12 h-12 text-gray-300" />} title="No website inquiries" />
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openDetail(c)}
              className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all ${
                c.status === 'new' ? 'border-l-4 border-l-red-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.email}</p>
                  {c.phone ? <p className="text-sm text-gray-500">{c.phone}</p> : null}
                </div>
                <Badge variant={STATUS_VARIANT[c.status]} className="text-xs capitalize shrink-0">
                  {c.status}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-800 truncate">{c.subject}</p>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{c.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(c.created_at).toLocaleString('en-IN')}
              </p>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.subject || 'Website contact'}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 mt-1">
              <Badge variant={STATUS_VARIANT[detail.status]} className="capitalize">
                {detail.status}
              </Badge>
              <RecordDetailRows
                rows={[
                  ['Name', detail.name],
                  ['Email', detail.email],
                  [
                    'Mobile',
                    detail.phone ? (
                      <a href={`tel:${detail.phone}`} className="inline-flex items-center gap-1 text-[#3B5FC0] hover:underline">
                        <Phone className="w-3.5 h-3.5" />
                        {detail.phone}
                      </a>
                    ) : null,
                  ],
                  ['Submitted', new Date(detail.created_at).toLocaleString('en-IN')],
                ]}
              />
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">Message</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{detail.message}</p>
              </div>
              <div className="flex gap-2 pt-1">
                {(['new', 'read', 'replied'] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={detail.status === s ? 'default' : 'outline'}
                    className="flex-1 capitalize"
                    disabled={updating || detail.status === s}
                    onClick={() => updateStatus(detail.id, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
