import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { Phone, Plus, Trash2, Edit2 } from 'lucide-react';
import api from '../../lib/apiClient';

interface HelplineEntry {
  id: string;
  profession: string;
  name: string;
  phone: string;
}

export default function Helpline() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<HelplineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState<HelplineEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ profession: '', name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'pramukh' || user?.role === 'admin';

  const fetchContacts = () => {
    setLoading(true);
    api.get<HelplineEntry[]>('/helpline').then(setContacts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleAdd = async () => {
    if (!form.profession.trim() || !form.name.trim() || !form.phone.trim()) {
      toast({ title: 'Error', description: 'Profession, name and phone are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/helpline', form);
      toast({ title: 'Contact added' });
      setShowForm(false);
      setForm({ profession: '', name: '', phone: '' });
      fetchContacts();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editContact || !form.profession.trim() || !form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    try {
      await api.patch(`/helpline/${editContact.id}`, form);
      toast({ title: 'Contact updated' });
      setEditContact(null);
      fetchContacts();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/helpline/${deleteId}`);
      toast({ title: 'Contact deleted' });
      fetchContacts();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setDeleteId(null); }
  };

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Helpline" subtitle="Emergency contacts"
        action={canManage ? <Button size="sm" onClick={() => {
          setForm({ profession: '', name: '', phone: '' });
          setShowForm(true);
        }} className="gap-1"><Plus className="w-4 h-4" />New</Button> : undefined}
      />
      
      {contacts.length === 0 ? (
        <EmptyState icon={<Phone className="w-12 h-12 text-gray-300" />} title="No contacts added" description="No emergency contacts have been added yet." />
      ) : (
        <div className="space-y-3">
          {contacts.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors">
              <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-sky-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400 capitalize">{c.profession}</p>
                <a href={`tel:${c.phone}`} className="text-sm text-blue-600 font-medium hover:underline">{c.phone}</a>
              </div>
              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => {
                    setForm({ profession: c.profession, name: c.name, phone: c.phone });
                    setEditContact(c);
                  }} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm || !!editContact} onOpenChange={o => {
        if (!o) { setShowForm(false); setEditContact(null); }
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editContact ? 'Edit Contact' : 'New Contact'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Profession * (e.g. Plumber, Electrician)" value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} />
            <Input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Phone * (10-digit Indian mobile)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Button className="w-full py-6 text-base shadow-lg" disabled={submitting} onClick={editContact ? handleEdit : handleAdd}>
              {submitting ? 'Saving...' : editContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Delete Contact?"
        description="Are you sure you want to delete this contact?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
