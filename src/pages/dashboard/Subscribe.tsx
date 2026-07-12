import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../components/ui/use-toast';
import { MobileAppPrompt, MobileOnlyButton } from '../../components/ui/MobileAppPrompt';
import {
  Calendar, Star, Infinity, CheckCircle2, Lock, Newspaper,
  Tag, ArrowUp, X, Smartphone,
} from 'lucide-react';
import api from '../../lib/apiClient';
import type { SubscriptionPlan, PromoValidation } from '../../types';
import { getPlanDisplayPrices } from '../../lib/appLinks';

const PLAN_COLORS = ['#3B5FC0', '#F59E0B', '#16A34A', '#8B5CF6', '#EC4899'];
const PLAN_ICONS = [Calendar, Star, Infinity, Star, Star];

function formatRupee(rupees: number): string {
  return `₹${rupees.toLocaleString('en-IN')}`;
}

function getPeriodLabel(months: number | null): string {
  if (months == null) return 'one-time';
  if (months === 12) return '/ year';
  return '/ month';
}

export default function Subscribe() {
  const { subscription, hasActiveSubscription, refreshSubscription } = useAuth();
  const { toast } = useToast();

  const [catalogPlans, setCatalogPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-plan' | 'plans'>(
    hasActiveSubscription ? 'my-plan' : 'plans',
  );

  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<PromoValidation | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [includeNewspaper, setIncludeNewspaper] = useState(false);
  const [newspaperLoading, setNewspaperLoading] = useState(false);

  useEffect(() => {
    api.get<SubscriptionPlan[]>('/subscriptions/plans')
      .then(setCatalogPlans)
      .catch(() => setCatalogPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const planRank = useMemo(() => {
    const m: Record<string, number> = {};
    [...catalogPlans]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .forEach((p, i) => { m[p.slug] = i + 1; });
    return m;
  }, [catalogPlans]);

  const displayPlans = useMemo(() => catalogPlans.map((p, i) => {
    const addP = p.newspaper_addon_paise;
    const addRupee = addP != null ? Math.round(addP / 100) : (p.months === 12 ? 36 : 3);
    const { amountRupees, compareAtRupees } = getPlanDisplayPrices(p.slug, p.amount_paise);
    return {
      ...p,
      color: PLAN_COLORS[i % PLAN_COLORS.length],
      Icon: PLAN_ICONS[i % PLAN_ICONS.length],
      highlight: i === catalogPlans.length - 1 && catalogPlans.length > 0,
      priceLabel: formatRupee(amountRupees),
      compareAtLabel: compareAtRupees != null ? formatRupee(compareAtRupees) : null,
      period: getPeriodLabel(p.months),
      allowNewspaper: !!p.allow_newspaper_addon && p.months != null,
      newspaperAddonRupees: addRupee,
      featureList: p.features?.length ? p.features : ['Full access to all modules'],
    };
  }), [catalogPlans]);

  const minNewsRupee = useMemo(() => {
    const vals = catalogPlans
      .filter(p => p.months != null && p.allow_newspaper_addon)
      .map(p => {
        const addP = p.newspaper_addon_paise;
        return addP != null ? Math.round(addP / 100) : (p.months === 12 ? 36 : 3);
      });
    return vals.length ? Math.min(...vals) : 3;
  }, [catalogPlans]);

  const currentCat = catalogPlans.find(c => c.slug === subscription?.plan);
  const isLifetime = currentCat ? currentCat.months == null : subscription?.plan === 'lifetime';
  const isYearly = currentCat ? currentCat.months === 12 : subscription?.plan === 'yearly';
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const daysLeft = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const newspaperExpiresAt = subscription?.newspaper_expires_at
    ? new Date(subscription.newspaper_expires_at)
    : null;
  const newspaperExpiryShown = newspaperExpiresAt || (!isLifetime ? expiresAt : null);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    const planForPromo = catalogPlans[0]?.slug || 'monthly';
    setPromoLoading(true);
    try {
      const result = await api.post<PromoValidation>('/promos/validate', {
        code: promoCode.trim(),
        plan: planForPromo,
      });
      setPromoResult(result);
      toast({
        title: 'Promo code valid',
        description: 'Apply this code when subscribing in the mobile app.',
      });
    } catch (e: unknown) {
      setPromoResult(null);
      toast({ title: 'Invalid code', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setPromoLoading(false);
    }
  };

  const disableNewspaperAddon = async () => {
    if (!window.confirm('Are you sure you want to disable the newspaper add-on?')) return;
    setNewspaperLoading(true);
    try {
      await api.post('/subscriptions/newspaper-addon', { enable: false });
      await refreshSubscription();
      toast({ title: 'Newspaper add-on disabled' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setNewspaperLoading(false);
    }
  };

  if (loading) return <div><LoadingSkeleton rows={3} /></div>;

  return (
    <div>
      <PageHeader title="Subscription" subtitle="View plans on web — subscribe in the mobile app" />

      <MobileAppPrompt feature="subscription" variant="banner" className="mb-5" />

      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
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
        <button
          role="tab"
          aria-selected={activeTab === 'plans'}
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'plans' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Explore Plans
        </button>
      </div>

      {activeTab === 'my-plan' && (
        <div className="space-y-4">
          {hasActiveSubscription && subscription ? (
            <>
              <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (isLifetime ? '#16A34A' : isYearly ? '#F59E0B' : '#3B5FC0') + '20' }}
                  >
                    {isLifetime ? <Infinity className="w-6 h-6 text-green-600" /> : isYearly ? <Star className="w-6 h-6 text-amber-500" /> : <Calendar className="w-6 h-6 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900">
                      {currentCat?.title || subscription.plan}
                    </p>
                    <Badge className="bg-green-100 text-green-700 mt-1">Active</Badge>
                  </div>
                  <p className="font-bold text-gray-900">
                    {currentCat
                      ? `${formatRupee(getPlanDisplayPrices(currentCat.slug, currentCat.amount_paise).amountRupees)}${isLifetime ? '' : isYearly ? '/yr' : '/mo'}`
                      : subscription.plan}
                  </p>
                </div>

                {isLifetime ? (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <Infinity className="w-4 h-4" /> Never expires — you&apos;re set for life
                  </p>
                ) : (
                  <p className={`text-sm flex items-center gap-2 ${daysLeft !== null && daysLeft <= 5 ? 'text-red-600' : 'text-gray-600'}`}>
                    {daysLeft !== null && daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining` : 'Expires today'}
                  </p>
                )}

                {expiresAt && !isLifetime && (
                  <p className="text-xs text-gray-500 mt-2">
                    Renews on {expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}

                <p className="text-sm text-green-600 mt-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> All modules unlocked
                </p>

                {!isLifetime && (
                  <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => setActiveTab('plans')}>
                    <ArrowUp className="w-4 h-4" />
                    View upgrade options
                  </Button>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Newspaper</p>
                    <p className="text-sm text-gray-500">Daily newspapers in English, Hindi & Gujarati</p>
                  </div>
                  {subscription.newspaper_addon && (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  )}
                </div>

                {subscription.newspaper_addon ? (
                  <div className="text-center">
                    {newspaperExpiryShown ? (
                      <p className="text-sm text-gray-600 mb-3">
                        Expires on {newspaperExpiryShown.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 mb-3">Newspaper access is active</p>
                    )}
                    <Button variant="ghost" className="text-red-600" disabled={newspaperLoading} onClick={disableNewspaperAddon}>
                      Disable plan
                    </Button>
                  </div>
                ) : (
                  <>
                    <MobileAppPrompt feature="newspaper-addon" variant="compact" className="mb-3" />
                    <MobileOnlyButton feature="newspaper-addon" className="w-full gap-2">
                      <Smartphone className="w-4 h-4" /> Add newspaper in mobile app
                    </MobileOnlyButton>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
              <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-lg text-gray-900">
                {subscription?.status === 'expired' ? 'Subscription Expired' : 'No Active Subscription'}
              </p>
              <p className="text-sm text-gray-500 mt-2 mb-4">
                {subscription?.status === 'expired'
                  ? 'Your plan has expired. Renew in the mobile app to regain access.'
                  : 'Subscribe in the mobile app to unlock all features.'}
              </p>
              <MobileOnlyButton feature="subscription" className="gap-2">
                <Smartphone className="w-4 h-4" /> Download app to subscribe
              </MobileOnlyButton>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Choose a Plan</h2>
            <p className="text-sm text-gray-500">Browse plans here — payment is completed in the mobile app</p>
          </div>

          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
              includeNewspaper ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Newspaper className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Newspaper add-on</p>
              <p className="text-sm text-gray-500">Select when subscribing in the mobile app</p>
              <p className="text-sm font-bold text-orange-600 mt-1">From +₹{minNewsRupee} / month tier</p>
            </div>
            <Switch checked={includeNewspaper} onCheckedChange={setIncludeNewspaper} disabled title="Preview only — toggle in mobile app at checkout" />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Promo Code
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Check promo validity"
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
                className="flex-1 uppercase"
              />
              <Button variant="outline" onClick={applyPromo} disabled={promoLoading || !promoCode.trim()}>
                {promoLoading ? '...' : 'Check'}
              </Button>
            </div>
            {promoResult && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="flex-1">
                  Valid — use code <strong>{promoResult.code}</strong> in the mobile app at checkout
                  {promoResult.type === 'percent'
                    ? ` (${promoResult.value}% off)`
                    : ` (₹${promoResult.value} off)`}
                </span>
                <button type="button" onClick={() => { setPromoCode(''); setPromoResult(null); }}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {displayPlans.map(plan => {
            const isCurrent = subscription?.plan === plan.slug && hasActiveSubscription;
            const currentRank = hasActiveSubscription && subscription?.plan
              ? (planRank[subscription.plan] ?? 0)
              : 0;
            const isLowerOrEqual = hasActiveSubscription && (planRank[plan.slug] ?? 0) <= currentRank && !isCurrent;
            const PlanIcon = plan.Icon;

            return (
              <div
                key={plan.slug}
                className={`relative bg-white rounded-2xl p-5 shadow-sm border-2 ${
                  plan.highlight ? 'border-green-400' : isCurrent ? 'border-green-300' : 'border-gray-100'
                }`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-2.5 left-4 bg-green-500 text-white text-xs">BEST VALUE</Badge>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: plan.color + '20' }}
                  >
                    <PlanIcon className="w-6 h-6" style={{ color: plan.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{plan.title}</p>
                    {plan.description && <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>}
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-2">
                      {plan.compareAtLabel && (
                        <span className="text-sm font-semibold text-gray-400 line-through">
                          {plan.compareAtLabel}
                        </span>
                      )}
                      <p className="text-xl font-bold" style={{ color: plan.color }}>{plan.priceLabel}</p>
                    </div>
                    <p className="text-xs text-gray-500">{plan.period}</p>
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {plan.featureList.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Current Plan
                  </Button>
                ) : isLowerOrEqual ? (
                  <Button className="w-full" variant="outline" disabled>
                    <Lock className="w-4 h-4 mr-2" /> Not Available
                  </Button>
                ) : (
                  <MobileOnlyButton
                    feature="subscription"
                    className="w-full text-white gap-2"
                    style={{ backgroundColor: plan.color }}
                    disabled={isLowerOrEqual}
                  >
                    <Smartphone className="w-4 h-4" />
                    {hasActiveSubscription ? `Upgrade — ${plan.priceLabel}` : `Subscribe — ${plan.priceLabel}`}
                    {includeNewspaper && plan.allowNewspaper ? ` + ₹${plan.newspaperAddonRupees} newspaper` : ''}
                    {promoResult ? ` → ₹${promoResult.final_amount}` : ''}
                    <span className="text-xs opacity-90 ml-1">(mobile app)</span>
                  </MobileOnlyButton>
                )}
              </div>
            );
          })}

          {displayPlans.length === 0 && (
            <p className="text-center text-gray-400 py-8">Plans are not available. Please try again later.</p>
          )}
        </div>
      )}
    </div>
  );
}
