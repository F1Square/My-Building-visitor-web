import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BuildingSelect, AdminBuildingPrompt } from '../../components/admin/BuildingSelect';
import { useAdminBuilding } from '../../hooks/useAdminBuilding';
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

const PHONE_RE = /^[6-9]\d{9}$/;

const PROFESSION_OPTIONS = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Security Guard',
  'Lift Technician', 'Pest Control', 'Housekeeping', 'Doctor', 'Ambulance',
  'Fire Station', 'Police', 'Gas Agency', 'Water Supply', 'Other',
];

type FormState = { profession: string; name: string; phone: string };
type FormErrors = { profession?: string; name?: string; phone?: string; general?: string };

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.profession.trim()) errors.profession = 'Please select a profession';
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (!PHONE_RE.test(form.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number starting with 6–9';
  }
  return errors;
}

export default function Helpline() {
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
  const [contacts, setContacts] = useState<HelplineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState<HelplineEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ profession: '', name: '', phone: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'pramukh' || user?.role === 'admin';

  const fetchContacts = () => {
    if (needsBuilding) {
      setContacts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get<HelplineEntry[]>('/helpline', buildingId ? { building_id: buildingId } : undefined)
      .then(setContacts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, [buildingId, needsBuilding]);

  const resetForm = () => {
    setForm({ profession: '', name: '', phone: '' });
    setErrors({});
  };

  const handleAdd = async () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setErrors({});
    try {
      await api.post('/helpline', {
        profession: form.profession.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        ...(buildingId ? { building_id: buildingId } : {}),
      });
      toast({ title: 'Contact added' });
      setShowForm(false);
      resetForm();
      fetchContacts();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to add contact';
      setErrors({ general: message });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editContact) return;
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setErrors({});
    try {
      await api.patch(`/helpline/${editContact.id}`, {
        profession: form.profession.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      toast({ title: 'Contact updated' });
      setEditContact(null);
      resetForm();
      fetchContacts();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update contact';
      setErrors({ general: message });
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

  if (loading && !needsBuilding) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      {isAdmin && (
        <BuildingSelect className="mb-4" buildings={buildings} loading={buildingsLoading} value={selectedBuilding} onChange={selectBuilding} />
      )}
      {needsBuilding ? (
        <AdminBuildingPrompt />
      ) : (<>
      <PageHeader title="Helpline" subtitle="Emergency contacts"
        action={canManage ? <Button size="sm" onClick={() => {
          resetForm();
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
                    setErrors({});
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
        if (!o) { setShowForm(false); setEditContact(null); resetForm(); }
      }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editContact ? 'Edit Contact' : 'New Contact'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            {errors.general && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.general}</p>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Profession *</label>
              <select
                value={form.profession}
                onChange={e => {
                  setForm(f => ({ ...f, profession: e.target.value }));
                  setErrors(prev => ({ ...prev, profession: undefined, general: undefined }));
                }}
                className={`w-full h-10 rounded-md border bg-background px-3 text-sm ${errors.profession ? 'border-red-400' : 'border-input'}`}
              >
                <option value="">Select profession</option>
                {PROFESSION_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.profession && <p className="text-xs text-red-600 mt-1">{errors.profession}</p>}
            </div>
            <div>
              <Input
                placeholder="Contact name *"
                value={form.name}
                onChange={e => {
                  setForm(f => ({ ...f, name: e.target.value }));
                  setErrors(prev => ({ ...prev, name: undefined, general: undefined }));
                }}
                className={errors.name ? 'border-red-400' : undefined}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Input
                placeholder="Phone * (10-digit Indian mobile)"
                value={form.phone}
                onChange={e => {
                  setForm(f => ({ ...f, phone: e.target.value }));
                  setErrors(prev => ({ ...prev, phone: undefined, general: undefined }));
                }}
                className={errors.phone ? 'border-red-400' : undefined}
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
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
      </>)}
    </div>
  );
}
