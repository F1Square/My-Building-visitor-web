import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ScrollReveal } from "@/components/landing/scroll/ScrollReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);
  const mockupScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section ref={sectionRef} className="relative pt-32 pb-20 px-4 overflow-hidden">
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2"
        style={reduced ? undefined : { y: blobY1 }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/2"
        style={reduced ? undefined : { y: blobY2 }}
      />

      <motion.div
        className="max-w-7xl mx-auto relative"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal delay={0.05}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Trusted by 500+ societies
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Smart Society
              <span className="text-gradient block">Management App</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Manage maintenance, visitors, complaints, and community—all from one powerful app built for modern societies.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.24}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register-society">
                <Button size="lg" className="gap-2 px-8 text-base">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#app-demo">
                <Button variant="outline" size="lg" className="gap-2 px-8 text-base">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </Button>
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="text-accent font-semibold">✓</span> Free 14-day trial
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-accent font-semibold">✓</span> No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-accent font-semibold">✓</span> Cancel anytime
              </div>
            </div>
          </ScrollReveal>
        </div>

        <motion.div
          className="mt-16 max-w-4xl mx-auto"
          style={reduced ? undefined : { scale: mockupScale, y: mockupY }}
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
            </div>
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Units", value: "248", color: "bg-primary/10 text-primary" },
                { label: "Maintenance Due", value: "₹4.2L", color: "bg-destructive/10 text-destructive" },
                { label: "Active Complaints", value: "12", color: "bg-yellow-500/10 text-yellow-600" },
                { label: "Visitors Today", value: "34", color: "bg-accent/10 text-accent" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={`rounded-xl p-4 ${stat.color}`}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.45 }}
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs mt-1 opacity-80">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
