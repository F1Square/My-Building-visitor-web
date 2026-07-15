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

  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.45]);
  const mockupScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 28]);

  return (
    <section ref={sectionRef} className="relative pt-28 sm:pt-36 pb-24 px-4 overflow-hidden">
      <motion.div
        className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-primary/[0.07] rounded-full blur-3xl -translate-y-1/2"
        style={reduced ? undefined : { y: blobY1 }}
        aria-hidden
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/[0.05] rounded-full blur-3xl translate-y-1/3"
        style={reduced ? undefined : { y: blobY2 }}
        aria-hidden
      />

      <motion.div
        className="max-w-7xl mx-auto relative"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal delay={0.05}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/70 bg-background/70 backdrop-blur-md text-foreground/80 text-sm font-medium mb-8 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Built for modern Indian societies
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <h1 className="hero-heading text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight mb-7">
              Smart Society
              <span className="text-gradient block mt-1">Management App</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Maintenance, visitors, complaints, and community — crafted into one calm, powerful experience.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.24}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/register-society">
                <Button size="lg" className="gap-2 px-8 text-base rounded-full h-12 shadow-md shadow-primary/20">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#app-demo">
                <Button variant="outline" size="lg" className="gap-2 px-8 text-base rounded-full h-12 bg-background/60 backdrop-blur-sm">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </Button>
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-sm text-muted-foreground">
              {["Free 14-day trial", "No credit card", "Cancel anytime"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-primary font-semibold" aria-hidden>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <motion.div
          className="mt-20 max-w-4xl mx-auto"
          style={reduced ? undefined : { scale: mockupScale, y: mockupY }}
        >
          <div className="relative rounded-[1.75rem] border border-border/80 bg-card/90 shadow-[0_40px_80px_-40px_rgba(30,58,138,0.35)] overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-border/70 bg-muted/40">
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <span className="ml-3 text-xs text-muted-foreground font-medium tracking-wide">MyBuilding Dashboard</span>
            </div>
            <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Total Units", value: "248", color: "bg-primary/[0.08] text-primary" },
                { label: "Maintenance Due", value: "₹4.2L", color: "bg-destructive/[0.07] text-destructive" },
                { label: "Active Complaints", value: "12", color: "bg-amber-500/[0.08] text-amber-700 dark:text-amber-400" },
                { label: "Visitors Today", value: "34", color: "bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={`rounded-2xl p-4 sm:p-5 ${stat.color}`}
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs mt-1.5 opacity-75 font-medium">{stat.label}</p>
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
