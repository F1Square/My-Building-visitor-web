import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { Car, Plus, Trash2, Edit2, Bell, Flag, Search } from 'lucide-react';
import api from '../../lib/apiClient';
import type { Vehicle } from '../../types';

interface ParkingReport {
  id: string;
  vehicle_number: string;
  description: string;
  location?: string;
  reporter_name?: string;
  reporter_flat?: string;
  created_at: string;
}

function getVehicleIcon(type: string) {
  const t = type?.toLowerCase() ?? '';
  if (t.includes('bike') || t.includes('two') || t.includes('scooter') || t.includes('motor')) return '🏍️';
  if (t.includes('car') || t.includes('four') || t.includes('suv') || t.includes('truck')) return '🚗';
  return '🚗';
}

export default function Parking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';
  const isPramukh = user?.role === 'pramukh';
  const canSendReminder = isAdmin || isPramukh;

  const [activeTab, setActiveTab] = useState<'vehicles' | 'reports'>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reports, setReports] = useState<ParkingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Add vehicle
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle_number: '', type: '', owner_name: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete vehicle
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Edit vehicle
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [editForm, setEditForm] = useState({ vehicle_number: '', type: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Report misparking
  const [reportVehicle, setReportVehicle] = useState<Vehicle | null>(null);
  const [reportForm, setReportForm] = useState({ description: '', location: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const fetchVehicles = () => {
    setLoading(true);
    api.get<Vehicle[]>('/vehicles/building').then(setVehicles).catch(() => {}).finally(() => setLoading(false));
  };

  const fetchReports = () => {
    setReportsLoading(true);
    api.get<ParkingReport[]>('/vehicles/reports').then(setReports).catch(() => {}).finally(() => setReportsLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  useEffect(() => {
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  const handleAdd = async () => {
    if (!form.vehicle_number.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/vehicles', { vehicle_number: form.vehicle_number, vehicle_type: form.type || 'four_wheeler', owner_name: form.owner_name });
      toast({ title: 'Vehicle added' });
      setShowForm(false);
      setForm({ vehicle_number: '', type: '', owner_name: '' });
      fetchVehicles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const endpoint = isAdmin ? `/vehicles/admin/${deleteId}` : `/vehicles/${deleteId}`;
      await api.delete(endpoint);
      toast({ title: 'Vehicle removed' });
      fetchVehicles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setDeleteId(null); }
  };

  const handleEdit = async () => {
    if (!editVehicle || !editForm.vehicle_number.trim()) return;
    setEditSubmitting(true);
    try {
      await api.patch(`/vehicles/admin/${editVehicle.id}`, { vehicle_number: editForm.vehicle_number, vehicle_type: editForm.type });
      toast({ title: 'Vehicle updated' });
      setEditVehicle(null);
      fetchVehicles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setEditSubmitting(false); }
  };

  const handleSendReminder = async (vehicleNumber: string) => {
    try {
      await api.post('/vehicles/reminder', { vehicle_number: vehicleNumber });
      toast({ title: 'Reminder sent', description: 'Vehicle owner has been notified.' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleReport = async () => {
    if (!reportVehicle || !reportForm.description.trim()) return;
    setReportSubmitting(true);
    try {
      await api.post('/vehicles/report', {
        vehicle_number: reportVehicle.vehicle_number,
        description: reportForm.description,
        location: reportForm.location,
      });
      toast({ title: 'Report submitted', description: 'Misparking report has been filed.' });
      setReportVehicle(null);
      setReportForm({ description: '', location: '' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setReportSubmitting(false); }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.vehicle_number.toLowerCase().includes(search.toLowerCase())
  );

  const myVehicles = vehicles.filter(v => v.user_id === user?.id);

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader
        title="Parking"
        subtitle="Manage vehicles and parking"
        action={
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus className="w-4 h-4" />Add
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        <button
          role="tab"
          aria-selected={activeTab === 'vehicles'}
          onClick={() => setActiveTab('vehicles')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'vehicles' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Vehicles
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'reports'}
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'reports' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reports
        </button>
      </div>

      {activeTab === 'vehicles' && (
        <>
          {/* My Vehicles summary */}
          {myVehicles.length > 0 && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
              You have <strong>{myVehicles.length}</strong> registered vehicle{myVehicles.length > 1 ? 's' : ''}.
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by vehicle number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredVehicles.length === 0 ? (
            search ? (
              <p className="text-center text-gray-400 py-8">No vehicles match "{search}"</p>
            ) : (
              <EmptyState icon={<Car className="w-12 h-12 text-gray-300" />} title="No vehicles registered" />
            )
          ) : (
            <div className="space-y-3">
              {filteredVehicles.map(v => (
                <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-2xl">
                      {getVehicleIcon(v.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{v.vehicle_number}</p>
                      <p className="text-sm text-gray-500">
                        {v.type}
                        {v.owner_name ? ` · ${v.owner_name}` : ''}
                        {user?.flat_no && v.user_id === user.id ? ` · Flat ${user.flat_no}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {canSendReminder && (
                        <button
                          onClick={() => handleSendReminder(v.vehicle_number)}
                          className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Send Reminder"
                          aria-label="Send Reminder"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => { setReportVehicle(v); setReportForm({ description: '', location: '' }); }}
                        className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Report Misparking"
                        aria-label="Report"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { setEditVehicle(v); setEditForm({ vehicle_number: v.vehicle_number, type: v.type }); }}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Vehicle"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(v.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'reports' && (
        <>
          {reportsLoading ? (
            <LoadingSkeleton />
          ) : reports.length === 0 ? (
            <EmptyState icon={<Flag className="w-12 h-12 text-gray-300" />} title="No parking reports" />
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-gray-900">{r.vehicle_number}</p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{r.description}</p>
                  {r.location && <p className="text-xs text-gray-500">📍 {r.location}</p>}
                  {(r.reporter_name || r.reporter_flat) && (
                    <p className="text-xs text-gray-400 mt-1">
                      Reported by {r.reporter_name}{r.reporter_flat ? ` · Flat ${r.reporter_flat}` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Vehicle number *" value={form.vehicle_number} onChange={e => setForm(f => ({ ...f, vehicle_number: e.target.value }))} />
            <Input placeholder="Type (Car, Bike, etc.)" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
            <Input placeholder="Owner name" value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} />
            <Button className="w-full" disabled={submitting} onClick={handleAdd}>{submitting ? 'Adding...' : 'Add Vehicle'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={!!editVehicle} onOpenChange={o => !o && setEditVehicle(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Vehicle</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Vehicle number *" value={editForm.vehicle_number} onChange={e => setEditForm(f => ({ ...f, vehicle_number: e.target.value }))} />
            <Input placeholder="Type (Car, Bike, etc.)" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} />
            <Button className="w-full" disabled={editSubmitting} onClick={handleEdit}>{editSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Misparking Dialog */}
      <Dialog open={!!reportVehicle} onOpenChange={o => !o && setReportVehicle(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report Misparking</DialogTitle></DialogHeader>
          {reportVehicle && (
            <div className="space-y-3 mt-2">
              <p className="text-sm text-gray-500">Vehicle: <strong>{reportVehicle.vehicle_number}</strong></p>
              <Textarea
                placeholder="Describe the misparking issue *"
                value={reportForm.description}
                onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
              <Input placeholder="Location (optional)" value={reportForm.location} onChange={e => setReportForm(f => ({ ...f, location: e.target.value }))} />
              <Button className="w-full" disabled={reportSubmitting || !reportForm.description.trim()} onClick={handleReport}>
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => !o && setDeleteId(null)}
        title="Remove vehicle?"
        description="This will remove the vehicle from your account."
        confirmLabel="Remove"
        onConfirm={handleDelete}
      />
    </div>
  );
}
