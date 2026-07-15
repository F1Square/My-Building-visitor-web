import { useEffect, useMemo, useState } from "react";
import { Check, Calendar, Star, Infinity, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayStoreButton } from "@/components/ui/MobileAppPrompt";
import { formatPlanHeading, getPlanDisplayPrices } from "@/lib/appLinks";
import { ScrollReveal, StaggerItem, StaggerReveal } from "@/components/landing/scroll/ScrollReveal";
import api from "@/lib/apiClient";
import type { SubscriptionPlan } from "@/types";

const PLAN_COLORS = ["#3B5FC0", "#F59E0B", "#16A34A"];
const PLAN_ICONS = [Calendar, Star, Infinity];
const DEFAULT_FEATURES = ["Full access to all modules"];

function formatRupee(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function getPeriodLabel(months: number | null): string {
  if (months == null) return "one-time";
  if (months === 12) return "/year";
  return "/month";
}

const FALLBACK_PLANS = [
  { slug: "monthly", title: "Monthly", amount_paise: 1000, months: 1 },
  { slug: "yearly", title: "Yearly", amount_paise: 12000, months: 12 },
  { slug: "lifetime", title: "Lifetime", amount_paise: 150000, months: null },
];

const PricingSection = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    api.get<SubscriptionPlan[]>("/subscriptions/plans")
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  const displayPlans = useMemo(() => {
    const source: SubscriptionPlan[] = plans.length > 0 ? plans : FALLBACK_PLANS.map((p, i) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      amount_paise: p.amount_paise,
      months: p.months,
      allow_newspaper_addon: p.months != null,
      sort_order: i,
    }));
    return source.map((p, i) => {
      const { amountRupees, compareAtRupees } = getPlanDisplayPrices(p.slug, p.amount_paise);
      return {
        ...p,
        heading: formatPlanHeading(p.title),
        description: p.description || "",
        color: PLAN_COLORS[i % PLAN_COLORS.length],
        Icon: PLAN_ICONS[i % PLAN_ICONS.length],
        popular: p.months === 12,
        best: p.months == null,
        price: formatRupee(amountRupees),
        compareAtPrice: compareAtRupees != null ? formatRupee(compareAtRupees) : null,
        period: getPeriodLabel(p.months),
        featureList: p.features?.length ? p.features : DEFAULT_FEATURES,
      };
    });
  }, [plans]);

  return (
    <section id="pricing" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Plans that grow with your society
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Register on the web in minutes. Subscribe and pay inside the MyBuilding Android app — simple, secure, and built for Indian societies.
          </p>
        </ScrollReveal>

        <StaggerReveal className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {displayPlans.map((plan) => {
            const Icon = plan.Icon;
            return (
              <StaggerItem key={plan.slug}>
              <div
                className={`relative rounded-3xl border p-7 lg:p-8 bg-card/90 backdrop-blur-sm flex flex-col transition-shadow hover:shadow-md h-full ${
                  plan.best
                    ? "border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/15"
                    : plan.popular
                    ? "border-primary/70 shadow-lg shadow-primary/10 z-10"
                    : "border-border/80"
                }`}
              >
                {plan.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-green-600 text-white text-[11px] font-bold tracking-wide uppercase">
                    Best value
                  </div>
                )}
                {plan.popular && !plan.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold tracking-wide uppercase">
                    Most popular
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${plan.color}18` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: plan.color }} />
                    </span>
                    <h3 className="text-lg font-bold leading-tight" style={{ color: plan.color }}>
                      {plan.heading}
                    </h3>
                  </div>
                  {!!plan.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                  )}
                </div>

                <div className="mb-6 flex items-baseline gap-2 flex-wrap">
                  {plan.compareAtPrice && (
                    <span className="text-lg font-semibold text-muted-foreground line-through decoration-solid">
                      {plan.compareAtPrice}
                    </span>
                  )}
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.featureList.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/register-society" className="block">
                  <Button
                    className="w-full font-semibold"
                    size="lg"
                    style={plan.best ? { backgroundColor: "#16A34A", color: "white" } : undefined}
                    variant={plan.popular || plan.best ? "default" : "outline"}
                  >
                    {plan.best ? "Register & go lifetime" : "Register your society"}
                  </Button>
                </Link>
              </div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>

        <ScrollReveal className="max-w-2xl mx-auto mt-14 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-4">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Ready to subscribe?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            After registration, open the MyBuilding app on Android to pick a plan and pay securely.
            iOS is on the way — Android users get the full experience today.
          </p>
          <PlayStoreButton label="Download on Google Play" />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PricingSection;
