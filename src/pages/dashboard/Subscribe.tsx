import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import { CheckCircle2, CreditCard } from 'lucide-react';
import api from '../../lib/apiClient';
import type { SubscriptionPlan } from '../../types';

export default function Subscribe() {
  const { subscription, setSubscription } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    api.get<SubscriptionPlan[]>('/subscriptions/plans').then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (planId: string) => {
    setPurchasing(planId);
    try {
      const result = await api.post<{ subscription: typeof subscription }>('/subscriptions', { plan_id: planId });
      if (result.subscription) setSubscription(result.subscription);
      toast({ title: 'Subscription activated!', description: 'Your plan is now active.' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setPurchasing(null); }
  };

  if (loading) return <div><LoadingSkeleton rows={3} /></div>;

  return (
    <div>
      <PageHeader title="Subscription" subtitle="Unlock all features for your society" />

      {/* Current subscription */}
      {subscription?.status === 'active' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Active: {subscription.plan}</p>
            {subscription.expires_at && (
              <p className="text-sm text-green-600">Expires {new Date(subscription.expires_at).toLocaleDateString('en-IN')}</p>
            )}
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="space-y-4">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-lg font-bold text-gray-900">{plan.name}</p>
                {plan.duration_days && <p className="text-sm text-gray-500">{plan.duration_days} days</p>}
              </div>
              <p className="text-2xl font-bold text-blue-600">₹{plan.price}</p>
            </div>
            {plan.features && plan.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {plan.features.map(f => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
              </div>
            )}
            <Button className="w-full gap-2" disabled={purchasing === plan.id} onClick={() => handlePurchase(plan.id)}>
              <CreditCard className="w-4 h-4" />
              {purchasing === plan.id ? 'Processing...' : 'Purchase Plan'}
            </Button>
          </div>
        ))}
        {plans.length === 0 && <p className="text-center text-gray-400 py-8">No plans available</p>}
      </div>
    </div>
  );
}
