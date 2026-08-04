import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { Newspaper, ExternalLink, Upload, Smartphone, Trash2 } from 'lucide-react';
import { MobileAppPrompt, MobileOnlyButton } from '../../components/ui/MobileAppPrompt';
import api from '../../lib/apiClient';
import type { NewspaperEdition } from '../../types';

export default function NewspaperPage() {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [editions, setEditions] = useState<NewspaperEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ date: '', language: 'english', title: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const hasAddon = isAdmin || (subscription?.status === 'active' && subscription?.newspaper_addon);

  const fetchEditions = () => {
    setLoading(true);
    api.get<NewspaperEdition[]>('/newspapers/recent').then(setEditions).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEditions(); }, []);

  const handleUpload = async () => {
    const title = form.title.trim();
    if (!file || !form.date || !title) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('date', form.date);
      fd.append('language', form.language);
      fd.append('title', title);
      fd.append('file', file);
      await api.post('/newspapers', fd);
      toast({ title: 'Edition uploaded' });
      setShowUpload(false);
      setFile(null);
      setForm({ date: '', language: 'english', title: '' });
      fetchEditions();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const openEdition = async (edition: NewspaperEdition) => {
    setOpeningId(edition.id);
    try {
      const data = await api.get<{ url?: string }>(`/newspapers/item/${edition.id}`);
      const url = data.url || edition.url || edition.file_url;
      if (url) window.open(url, '_blank');
      else toast({ title: 'Error', description: 'Newspaper URL not available', variant: 'destructive' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (edition: NewspaperEdition) => {
    const label = edition.title || `${edition.language} edition`;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeletingId(edition.id);
    try {
      await api.delete(`/newspapers/${edition.id}`);
      toast({ title: 'Edition deleted' });
      setEditions((prev) => prev.filter((e) => e.id !== edition.id));
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  if (!hasAddon) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <PageHeader title="Newspaper" />
        <MobileAppPrompt feature="newspaper-addon" variant="card" />
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/subscribe'}>View plans</Button>
          <MobileOnlyButton feature="newspaper-addon" className="gap-2">
            <Smartphone className="w-4 h-4" /> Get app
          </MobileOnlyButton>
        </div>
      </div>
    );
  }

  if (loading) return <div><LoadingSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Newspaper"
        action={isAdmin ? <Button size="sm" onClick={() => setShowUpload(true)} className="gap-1"><Upload className="w-4 h-4" />Upload</Button> : undefined}
      />
      {editions.length === 0 ? (
        <EmptyState icon={<Newspaper className="w-12 h-12 text-gray-300" />} title="No editions available" />
      ) : (
        <div className="space-y-3">
          {editions.map(e => (
            <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{e.title || `${e.language} Edition`}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {e.language} · {new Date(e.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdition(e)}
                  disabled={openingId === e.id}
                  className="gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> {openingId === e.id ? 'Opening…' : 'Open'}
                </Button>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(e)}
                    disabled={deletingId === e.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === e.id ? '…' : 'Delete'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Newspaper</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input
              placeholder="Title (e.g. Times of India)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              maxLength={150}
            />
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="gujarati">Gujarati</option>
            </select>
            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
            <Button className="w-full" disabled={uploading || !file || !form.date || !form.title.trim()} onClick={handleUpload}>
              {uploading ? 'Uploading...' : 'Upload Edition'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
