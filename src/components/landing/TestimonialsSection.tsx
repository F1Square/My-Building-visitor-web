import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Society Secretary, Green Valley Apartments",
    text: "MyBuilding has transformed how we manage our society. Maintenance collection went from 60% to 95% in just 3 months!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Resident, Sunrise Heights",
    text: "The visitor management system is brilliant. I can pre-approve guests from my phone and the guard gets notified instantly.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Committee Member, Royal Residency",
    text: "We tried 4 different apps before MyBuilding. None came close to this level of simplicity and completeness. Highly recommended!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Loved by societies everywhere
          </h2>
          <p className="text-muted-foreground text-lg">
            See what our users have to say about MyBuilding.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-8">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6 text-muted-foreground">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
