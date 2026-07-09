import { AnimatePresence, motion, type MotionValue, useTransform } from "framer-motion";
import { AppScreenByIndex } from "./AppScreenFrames";

type DeviceMockupProps = {
  frameIndex: number;
  scrollProgress?: MotionValue<number>;
  className?: string;
};

function DeviceShell({
  frameIndex,
  className,
  style,
}: {
  frameIndex: number;
  className?: string;
  style?: React.ComponentProps<typeof motion.div>["style"];
}) {
  return (
    <motion.div className={`relative mx-auto w-[260px] sm:w-[280px] ${className ?? ""}`} style={style}>
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-2xl opacity-70" />

      <div className="relative rounded-[2.5rem] border-[6px] border-foreground/90 bg-foreground/90 shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-24 h-5 bg-foreground/90 rounded-b-2xl" />

        <div className="relative aspect-[9/19.5] bg-background overflow-hidden rounded-[2rem]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={frameIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <AppScreenByIndex index={frameIndex} />
            </motion.div>
          </AnimatePresence>

          <motion.div
            key={`flash-${frameIndex}`}
            className="absolute inset-0 bg-white/30 pointer-events-none"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-background/40 z-20" />
      </div>
    </motion.div>
  );
}

function DeviceMockupWithScroll({
  frameIndex,
  scrollProgress,
  className,
}: {
  frameIndex: number;
  scrollProgress: MotionValue<number>;
  className?: string;
}) {
  const rotateY = useTransform(scrollProgress, [0, 0.5, 1], [-6, 0, 6]);
  const rotateX = useTransform(scrollProgress, [0, 0.5, 1], [4, 0, -4]);
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [0.96, 1, 0.98]);

  return (
    <DeviceShell
      frameIndex={frameIndex}
      className={className}
      style={{ rotateY, rotateX, scale, transformPerspective: 1200 }}
    />
  );
}

export function DeviceMockup({ frameIndex, scrollProgress, className }: DeviceMockupProps) {
  if (scrollProgress) {
    return (
      <DeviceMockupWithScroll
        frameIndex={frameIndex}
        scrollProgress={scrollProgress}
        className={className}
      />
    );
  }

  return <DeviceShell frameIndex={frameIndex} className={className} />;
}
