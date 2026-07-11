import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import api from '../lib/apiClient';
import { BrandLogo } from '../components/BrandLogo';

export default function Join() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ building_id: '', flat_no: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/buildings/join', form);
      toast({ title: 'Request sent!', description: 'Your join request has been submitted.' });
      navigate('/dashboard');
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <BrandLogo size="md" showWordmark={false} />
            <span className="text-xl font-bold">Join a Building</span>
          </div>
          <p className="text-muted-foreground text-sm">Enter your building ID and flat number to send a join request.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Building ID</Label>
            <Input placeholder="e.g. abc123" value={form.building_id} onChange={e => setForm(f => ({ ...f, building_id: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Flat Number</Label>
            <Input placeholder="e.g. A-101" value={form.flat_no} onChange={e => setForm(f => ({ ...f, flat_no: e.target.value }))} required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Sending request...' : 'Send Join Request'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Want to register a new society?{' '}
          <Link to="/register-society" className="text-primary font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
