import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Monthly",
    price: "₹15",
    period: "/month",
    desc: "Billed every month. Cancel anytime.",
    color: "#3B5FC0",
    features: [
      "Full access to all modules",
      "Maintenance billing & payments",
      "Visitor management",
      "Complaints & announcements",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Yearly",
    price: "₹180",
    period: "/year",
    desc: "Billed annually. Save ₹30 per year.",
    color: "#F59E0B",
    features: [
      "Everything in Monthly",
      "Save ₹30 per year",
      "No monthly hassle",
      "All modules included",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Lifetime",
    price: "₹1,500",
    period: "one-time",
    desc: "Pay once, use forever. Best value.",
    color: "#16A34A",
    features: [
      "Everything in Yearly",
      "No recurring charges",
      "Priority support",
      "All future features included",
    ],
    cta: "Get Lifetime Access",
    popular: false,
    best: true,
  },
];

const PricingSection = () => {
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
          {plans.map((plan) => (
            <div
              key={plan.name}
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

              <h3 className="text-xl font-bold mb-1" style={{ color: plan.color }}>{plan.name} Plan</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
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
                  style={
                    plan.best
                      ? { backgroundColor: "#16A34A", color: "white" }
                      : plan.popular
                      ? {}
                      : {}
                  }
                  variant={plan.popular || plan.best ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All plans include a <strong>14-day free trial</strong>. No credit card required.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
