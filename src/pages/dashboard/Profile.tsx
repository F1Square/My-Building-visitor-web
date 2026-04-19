import { useState } from 'react';
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
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', flat_no: user?.flat_no ?? '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.patch<User>('/auth/profile', form);
      updateUser(updated);
      toast({ title: 'Profile updated' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div>
      <PageHeader title="Profile" />

      {/* Avatar + role */}
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

      {/* Edit form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 mb-4">
        <h2 className="font-semibold text-gray-900">Edit Details</h2>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Flat No.</Label>
          <Input value={form.flat_no} onChange={e => setForm(f => ({ ...f, flat_no: e.target.value }))} />
        </div>
        <Button className="w-full" disabled={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>

      {/* Logout */}
      <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-2" onClick={handleLogout}>
        <LogOut className="w-4 h-4" /> Logout
      </Button>
    </div>
  );
}
