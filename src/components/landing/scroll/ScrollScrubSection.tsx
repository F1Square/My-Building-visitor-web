import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { APP_FRAMES } from "./AppScreenFrames";
import { DeviceMockup } from "./DeviceMockup";
import { ScrollReveal } from "./ScrollReveal";

const FRAME_COUNT = APP_FRAMES.length;

function MobileScrubCarousel() {
  const [active, setActive] = useState(0);

  return (
    <section id="app-demo" className="py-20 px-4 bg-muted/20 border-y border-border/60">
      <div className="max-w-lg mx-auto text-center mb-8">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">App experience</p>
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">Scroll through the app</h2>
        <p className="text-sm text-muted-foreground">
          Swipe to preview how MyBuilding works on your phone.
        </p>
      </div>

      <div className="flex gap-2 justify-center mb-6">
        {APP_FRAMES.map((frame, i) => (
          <button
            key={frame.id}
            type="button"
            aria-label={`Show ${frame.title}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              active === i ? "w-8 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      <DeviceMockup frameIndex={active} className="mb-6" />

      <div className="max-w-sm mx-auto text-center">
        <h3 className="font-bold text-lg mb-1">{APP_FRAMES[active].title}</h3>
        <p className="text-sm text-muted-foreground">{APP_FRAMES[active].subtitle}</p>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-sm rounded-lg border border-border"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          disabled={active === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground"
          onClick={() => setActive((a) => Math.min(FRAME_COUNT - 1, a + 1))}
          disabled={active === FRAME_COUNT - 1}
        >
          Next
        </button>
      </div>
    </section>
  );
}

function DesktopScrollScrub() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeFrame, setActiveFrame] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(FRAME_COUNT - 1, Math.floor(v * FRAME_COUNT));
    setActiveFrame((prev) => (prev === next ? prev : next));
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      id="app-demo"
      ref={containerRef}
      className="relative h-[420vh]"
      aria-label="Interactive app preview - scroll to scrub through screens"
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none"
          style={{ y: parallaxY }}
        />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          {/* Copy + step indicators */}
          <div className="order-2 lg:order-1">
            <ScrollReveal>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                App experience
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Scroll to explore
                <span className="text-gradient block">every module</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                A scroll-linked preview of MyBuilding - scrub through screens like a stop-motion demo as you scroll.
              </p>
            </ScrollReveal>

            <div className="space-y-3 relative">
              {APP_FRAMES.map((frame, i) => {
                const isActive = activeFrame === i;
                return (
                  <motion.div
                    key={frame.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      isActive
                        ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                        : "border-border/60 bg-card/50 opacity-60"
                    }`}
                    animate={{
                      x: isActive ? 0 : -4,
                      opacity: isActive ? 1 : 0.55,
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm">{frame.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{frame.subtitle}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronDown className="w-4 h-4" />
              Keep scrolling to scrub through screens
            </motion.div>
          </div>

          {/* Device */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <DeviceMockup
              frameIndex={activeFrame}
              scrollProgress={scrollYProgress}
            />
          </div>
        </div>

        {/* Scrub progress rail */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2">
          {APP_FRAMES.map((frame, i) => (
            <motion.div
              key={frame.id}
              className="w-1 rounded-full bg-border overflow-hidden"
              style={{ height: 28 }}
            >
              <motion.div
                className="w-full bg-primary rounded-full"
                animate={{ height: activeFrame >= i ? "100%" : "0%" }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StaticFallback() {
  return (
    <section id="app-demo" className="py-24 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">App experience</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Built for modern societies</h2>
          <p className="text-muted-foreground">{APP_FRAMES[0].subtitle}</p>
        </div>
        <DeviceMockup frameIndex={0} />
      </div>
    </section>
  );
}

export default function ScrollScrubSection() {
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  if (reduced) return <StaticFallback />;
  if (isMobile) return <MobileScrubCarousel />;
  return <DesktopScrollScrub />;
}
