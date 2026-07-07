import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import { Gift, Copy, AlertCircle } from 'lucide-react';
import api from '../../lib/apiClient';

interface ReferCode { referral_code: string }
interface Referral { id: string; reward_status: string; created_at: string }

export default function Refer() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ReferCode>('/refer/my-code'),
      api.get<Referral[]>('/refer/my-referrals'),
    ]).then(([c, r]) => {
      setCode(c.referral_code);
      setReferrals(r);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    const link = code
      ? `${window.location.origin}/register-society?ref=${encodeURIComponent(code)}`
      : `${window.location.origin}/register-society`;
    navigator.clipboard.writeText(link).then(() => toast({ title: 'Referral link copied!' }));
  };

  const isAdmin = user?.role === 'admin';
  const hasActiveSub = subscription?.status === 'active' || isAdmin;

  if (!hasActiveSub) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle className="w-14 h-14 text-amber-400" />
        <h2 className="text-xl font-bold text-gray-900">Subscription Required</h2>
        <p className="text-gray-500 max-w-sm">The Refer & Earn module requires an active subscription.</p>
        <Button onClick={() => navigate('/dashboard/subscribe')}>View Plans</Button>
      </div>
    );
  }

  if (loading) return <div><LoadingSkeleton rows={2} /></div>;

  return (
    <div>
      <PageHeader title="Refer & Earn" />
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6 text-center">
        <Gift className="w-12 h-12 mx-auto mb-3 opacity-90" />
        <p className="text-lg font-bold mb-1">Your Referral Code</p>
        <p className="text-3xl font-extrabold tracking-widest">{code ?? '—'}</p>
      </div>
      <Button className="w-full gap-2 mb-6" onClick={copyLink} disabled={!code}>
        <Copy className="w-4 h-4" /> Copy Referral Link
      </Button>

      {referrals.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-3">Your Referrals ({referrals.length})</p>
          <div className="space-y-2">
            {referrals.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                <span className="text-xs font-semibold text-blue-600 capitalize">{r.reward_status?.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
