import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/landing/scroll/ScrollReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Testimonial = {
  name: string;
  role: string;
  society: string;
  text: string;
  rating: number;
  initials: string;
  avatarClass: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Rajesh Kumar",
    role: "Society Secretary",
    society: "Green Valley Apartments, Surat",
    text: "MyBuilding has transformed how we manage our society. Maintenance collection went from 60% to 95% in just 3 months!",
    rating: 5,
    initials: "RK",
    avatarClass: "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground",
  },
  {
    name: "Priya Sharma",
    role: "Resident",
    society: "Sunrise Heights, Ahmedabad",
    text: "The visitor management system is brilliant. I can pre-approve guests from my phone and the guard gets notified instantly.",
    rating: 5,
    initials: "PS",
    avatarClass: "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground",
  },
  {
    name: "Amit Patel",
    role: "Committee Member",
    society: "Royal Residency, Vadodara",
    text: "We tried 4 different apps before MyBuilding. None came close to this level of simplicity and completeness. Highly recommended!",
    rating: 5,
    initials: "AP",
    avatarClass: "bg-gradient-to-br from-violet-500 to-violet-600 text-white",
  },
  {
    name: "Neha Desai",
    role: "Treasurer",
    society: "Shanti Enclave, Rajkot",
    text: "Maintenance reminders and payment tracking saved our committee hours every month. Residents finally pay on time.",
    rating: 5,
    initials: "ND",
    avatarClass: "bg-gradient-to-br from-amber-500 to-orange-500 text-white",
  },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-8 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <Quote className="w-8 h-8 text-primary/20 mb-4" aria-hidden />
      <div className="flex gap-1 mb-4" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm leading-relaxed mb-6 text-muted-foreground flex-1">
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-border/60">
        <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
          <AvatarFallback className={cn("text-sm font-bold", t.avatarClass)}>
            {t.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
          <p className="text-xs font-medium text-primary/80 mt-0.5">{t.society}</p>
        </div>
      </div>
    </article>
  );
}

const TestimonialsSection = () => {
  const reduced = usePrefersReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || reduced || paused) return;
    const timer = window.setInterval(() => emblaApi.scrollNext(), 5500);
    return () => window.clearInterval(timer);
  }, [emblaApi, reduced, paused]);

  return (
    <section id="testimonials" className="py-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Loved by societies everywhere
          </h2>
          <p className="text-muted-foreground text-lg">
            Hear from secretaries, treasurers, and residents across Gujarat.
          </p>
        </ScrollReveal>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex -ml-4">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3 pl-4"
                >
                  <TestimonialCard t={t} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    selected === i ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/40",
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {reduced && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Auto-rotate is off when reduced motion is enabled.
          </p>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
