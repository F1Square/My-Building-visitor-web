import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../components/ui/use-toast';
import { CheckCircle2, CreditCard, Star, Zap, FileText, ArrowUp, Tag } from 'lucide-react';
import api from '../../lib/apiClient';
import type { SubscriptionPlan, Promo } from '../../types';

const PLAN_TIERS: Record<string, number> = { basic: 1, standard: 2, premium: 3, pro: 4, enterprise: 5 };
const PLAN_ICONS: Record<string, string> = { basic: '📋', standard: '⭐', premium: '⭐', pro: '💎', enterprise: '🏆' };

function getPlanTier(name: string): number {
  return PLAN_TIERS[name.toLowerCase()] ?? 1;
}

function getPlanIcon(name: string): string {
  return PLAN_ICONS[name.toLowerCase()] ?? '📋';
}

function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Subscribe() {
  const { subscription, setSubscription } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-plan' | 'plans'>(
    subscription?.status === 'active' ? 'my-plan' : 'plans'
  );

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState<Promo | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Newspaper add-on
  const [newspaperAddon, setNewspaperAddon] = useState(subscription?.newspaper_addon ?? false);
  const [addonLoading, setAddonLoading] = useState(false);

  useEffect(() => {
    api.get<SubscriptionPlan[]>('/subscriptions/plans').then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoData(null);
    try {
      const result = await api.post<Promo>('/subscriptions/validate-promo', { code: promoCode.trim() });
      setPromoData(result);
      toast({ title: 'Promo applied!', description: `Discount: ${result.discount_percent ?? result.discount}%` });
    } catch (e: unknown) {
      setPromoError('Invalid or expired promo code.');
    } finally { setPromoLoading(false); }
  };

  const getDiscountedPrice = (price: number): number => {
    if (!promoData) return price;
    const pct = promoData.discount_percent ?? promoData.discount ?? 0;
    return Math.round(price * (1 - pct / 100));
  };

  const handlePurchase = async (planId: string, originalPrice: number) => {
    setPurchasing(planId);
    try {
      const payload: Record<string, unknown> = { plan_id: planId };
      if (promoData) payload.promo_code = promoCode;
      const result = await api.post<{ subscription: typeof subscription }>('/subscriptions', payload);
      if (result.subscription) setSubscription(result.subscription);
      setPromoCode('');
      setPromoData(null);
      toast({ title: 'Subscription activated!', description: 'Your plan is now active.' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setPurchasing(null); }
  };

  const handleUpgrade = async (planId: string) => {
    setPurchasing(planId);
    try {
      const result = await api.post<{ subscription: typeof subscription }>('/subscriptions/upgrade', { plan_id: planId });
      if (result.subscription) setSubscription(result.subscription);
      toast({ title: 'Plan upgraded!', description: 'Your subscription has been upgraded.' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setPurchasing(null); }
  };

  const handleNewspaperToggle = async (enabled: boolean) => {
    setAddonLoading(true);
    try {
      await api.post('/subscriptions/newspaper-addon', { enabled });
      setNewspaperAddon(enabled);
      toast({ title: enabled ? 'Newspaper add-on enabled' : 'Newspaper add-on disabled' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setAddonLoading(false); }
  };

  const daysRemaining = getDaysRemaining(subscription?.expires_at ?? null);
  const currentTier = subscription ? getPlanTier(subscription.plan) : 0;

  if (loading) return <div><LoadingSkeleton rows={3} /></div>;

  return (
    <div>
      <PageHeader title="Subscription" subtitle="Unlock all features for your society" />

      {/* Tabs — only show My Plan tab if active subscription */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
        {subscription?.status === 'active' && (
          <button
            role="tab"
            aria-selected={activeTab === 'my-plan'}
            onClick={() => setActiveTab('my-plan')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'my-plan' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Plan
          </button>
        )}
        <button
          role="tab"
          aria-selected={activeTab === 'plans'}
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'plans' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Available Plans
        </button>
      </div>

      {/* MY PLAN TAB */}
      {activeTab === 'my-plan' && subscription?.status === 'active' && (
        <div className="space-y-4">
          {/* Active plan card */}
          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-bold text-green-800 text-lg">
                  {getPlanIcon(subscription.plan)} {subscription.plan}
                </p>
                <p className="text-sm text-green-600">Active subscription</p>
              </div>
            </div>

            {daysRemaining !== null && (
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-700 font-medium">{daysRemaining} days remaining</span>
                  {subscription.expires_at && (
                    <span className="text-green-600">
                      Expires {new Date(subscription.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (daysRemaining / 30) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {subscription.start_date && (
              <p className="text-xs text-green-600">
                Started {new Date(subscription.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Newspaper add-on */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-gray-900">Newspaper Add-on</p>
                  <p className="text-sm text-gray-500">Daily newspaper delivery · ₹3/month</p>
                </div>
              </div>
              <Switch
                checked={newspaperAddon}
                onCheckedChange={handleNewspaperToggle}
                disabled={addonLoading}
                aria-label="newspaper-addon"
              />
            </div>
          </div>

          {/* Upgrade prompt */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setActiveTab('plans')}
          >
            <ArrowUp className="w-4 h-4" />
            View Upgrade Options
          </Button>
        </div>
      )}

      {/* AVAILABLE PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {/* Promo code */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Promo Code
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value); setPromoError(''); setPromoData(null); }}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleApplyPromo} disabled={promoLoading || !promoCode.trim()}>
                {promoLoading ? '...' : 'Apply'}
              </Button>
            </div>
            {promoData && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {promoData.discount_percent ?? promoData.discount}% discount applied
              </p>
            )}
            {promoError && <p className="text-sm text-red-500 mt-1">{promoError}</p>}
          </div>

          {/* Plan cards */}
          {plans.map(plan => {
            const planTier = getPlanTier(plan.name);
            const isCurrentPlan = subscription?.plan?.toLowerCase() === plan.name.toLowerCase() && subscription?.status === 'active';
            const canUpgrade = subscription?.status === 'active' && planTier > currentTier;
            const discountedPrice = getDiscountedPrice(plan.price);

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border ${isCurrentPlan ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getPlanIcon(plan.name)}</span>
                      <p className="text-lg font-bold text-gray-900">{plan.name}</p>
                      {isCurrentPlan && <Badge className="bg-green-100 text-green-700 text-xs">Current Plan</Badge>}
                    </div>
                    {plan.duration_days && <p className="text-sm text-gray-500">{plan.duration_days} days</p>}
                  </div>
                  <div className="text-right">
                    {promoData && discountedPrice < plan.price ? (
                      <>
                        <p className="text-sm text-gray-400 line-through">₹{plan.price}</p>
                        <p className="text-2xl font-bold text-green-600">₹{discountedPrice}</p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">₹{plan.price}</p>
                    )}
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                )}

                {isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Active
                  </Button>
                ) : canUpgrade ? (
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={purchasing === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    <Zap className="w-4 h-4" />
                    {purchasing === plan.id ? 'Upgrading...' : 'Upgrade to ' + plan.name}
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2"
                    disabled={purchasing === plan.id}
                    onClick={() => handlePurchase(plan.id, plan.price)}
                  >
                    <CreditCard className="w-4 h-4" />
                    {purchasing === plan.id ? 'Processing...' : 'Purchase Plan'}
                  </Button>
                )}
              </div>
            );
          })}

          {plans.length === 0 && <p className="text-center text-gray-400 py-8">No plans available</p>}
        </div>
      )}
    </div>
  );
}
