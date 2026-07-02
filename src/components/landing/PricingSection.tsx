import { useEffect, useMemo, useState } from "react";
import { Check, Calendar, Star, Infinity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MobileAppPrompt } from "@/components/ui/MobileAppPrompt";
import api from "@/lib/apiClient";
import type { SubscriptionPlan } from "@/types";

const PLAN_COLORS = ["#3B5FC0", "#F59E0B", "#16A34A"];
const PLAN_ICONS = [Calendar, Star, Infinity];

function formatRupee(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function getPeriodLabel(months: number | null): string {
  if (months == null) return "one-time";
  if (months === 12) return "/year";
  return "/month";
}

const FALLBACK_PLANS = [
  {
    slug: "monthly",
    title: "Monthly",
    description: "Billed every month. Cancel anytime.",
    amount_paise: 1500,
    months: 1,
    features: ["Full access to all modules", "Maintenance billing & payments", "Visitor management", "Complaints & announcements"],
  },
  {
    slug: "yearly",
    title: "Yearly",
    description: "Billed annually. Save ₹30 per year.",
    amount_paise: 18000,
    months: 12,
    features: ["Everything in Monthly", "Save ₹30 per year", "No monthly hassle", "All modules included"],
  },
  {
    slug: "lifetime",
    title: "Lifetime",
    description: "Pay once, use forever. Best value.",
    amount_paise: 150000,
    months: null,
    features: ["Everything in Yearly", "No recurring charges", "Priority support", "All future features included"],
  },
];

const PricingSection = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    api.get<SubscriptionPlan[]>("/subscriptions/plans")
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  const displayPlans = useMemo(() => {
    const source = plans.length > 0 ? plans : FALLBACK_PLANS.map((p, i) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      description: p.description,
      amount_paise: p.amount_paise,
      months: p.months,
      allow_newspaper_addon: p.months != null,
      sort_order: i,
      features: p.features,
    }));
    return source.map((p, i) => ({
      ...p,
      color: PLAN_COLORS[i % PLAN_COLORS.length],
      Icon: PLAN_ICONS[i % PLAN_ICONS.length],
      popular: p.months === 12,
      best: p.months == null,
      price: formatRupee(p.amount_paise),
      period: getPeriodLabel(p.months),
      featureList: p.features?.length ? p.features : ["Full access to all modules"],
    }));
  }, [plans]);

  return (
    <section id="pricing" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            One app, all features. Pick the plan that works for your society.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {displayPlans.map((plan) => {
            const Icon = plan.Icon;
            return (
              <div
                key={plan.slug}
                className={`relative rounded-2xl border p-8 bg-card flex flex-col ${
                  plan.best
                    ? "border-green-500 shadow-xl shadow-green-500/10"
                    : plan.popular
                    ? "border-primary shadow-xl shadow-primary/10 scale-105"
                    : "border-border"
                }`}
              >
                {plan.best && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-500 text-white text-xs font-semibold whitespace-nowrap">
                    BEST VALUE
                  </div>
                )}
                {plan.popular && !plan.best && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5" style={{ color: plan.color }} />
                  <h3 className="text-xl font-bold" style={{ color: plan.color }}>{plan.title} Plan</h3>
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                )}
                <div className="mb-6 flex items-end gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.featureList.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to="/register-society">
                  <Button
                    className="w-full font-bold"
                    size="lg"
                    style={plan.best ? { backgroundColor: "#16A34A", color: "white" } : undefined}
                    variant={plan.popular || plan.best ? "default" : "outline"}
                  >
                    {plan.best ? "Get Lifetime Access" : "Get Started"}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <MobileAppPrompt
          feature="subscription"
          variant="banner"
          className="max-w-3xl mx-auto mt-12"
          message="Register your society on web, then subscribe and pay securely in the MyBuilding mobile app."
        />
      </div>
    </section>
  );
};

export default PricingSection;
