import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/use-toast';
import { LogOut } from 'lucide-react';
import api from '../../lib/apiClient';
import type { User } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700', pramukh: 'bg-amber-100 text-amber-700',
  user: 'bg-green-100 text-green-700', watchman: 'bg-blue-100 text-blue-700',
};

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wings, setWings] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    flat_no: user?.flat_no ?? '',
    wing: user?.wing ?? '',
    total_members: user?.total_members != null ? String(user.total_members) : '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.building_id) {
      api.get<{ wings?: string[] }>('/buildings/my')
        .then(b => setWings(b.wings ?? []))
        .catch(() => setWings([]));
    }
  }, [user?.building_id]);

  const handleSave = async () => {
    if (!form.phone.trim()) {
      toast({ title: 'Mobile number is required', variant: 'destructive' });
      return;
    }
    if (!form.flat_no.trim()) {
      toast({ title: 'Flat number is required', variant: 'destructive' });
      return;
    }
    if (wings.length > 0 && !form.wing.trim()) {
      toast({ title: 'Wing is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        flat_no: form.flat_no.trim(),
        wing: form.wing.trim() || undefined,
        total_members: form.total_members ? parseInt(form.total_members, 10) : undefined,
      };
      const updated = await api.patch<User>('/auth/profile', payload);
      updateUser(updated);
      toast({ title: 'Profile updated' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div>
      <PageHeader title="My Details" />

      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[user?.role ?? 'user']}`}>
            {user?.role}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 mb-4">
        <h2 className="font-semibold text-gray-900">Edit Details</h2>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Phone *</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile" />
        </div>
        <div className="space-y-2">
          <Label>Flat No. *</Label>
          <Input value={form.flat_no} onChange={e => setForm(f => ({ ...f, flat_no: e.target.value }))} />
        </div>
        {wings.length > 0 && (
          <div className="space-y-2">
            <Label>Wing *</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.wing}
              onChange={e => setForm(f => ({ ...f, wing: e.target.value }))}
            >
              <option value="">Select wing</option>
              {wings.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Total Members in Flat</Label>
          <Input
            type="number"
            min={1}
            value={form.total_members}
            onChange={e => setForm(f => ({ ...f, total_members: e.target.value }))}
          />
        </div>
        <Button className="w-full" disabled={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>

      <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-2" onClick={handleLogout}>
        <LogOut className="w-4 h-4" /> Logout
      </Button>
    </div>
  );
}
