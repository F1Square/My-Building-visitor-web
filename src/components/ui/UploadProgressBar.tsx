import { Progress } from './progress';

type Props = {
  /** 0–100 when known; null hides the bar (no invented %). */
  progress: number | null;
  label?: string;
  className?: string;
};

/** Determinate upload bar — only renders when a real percent is available. */
export function UploadProgressBar({ progress, label, className }: Props) {
  if (progress == null) return null;
  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className={className ?? 'w-full space-y-1.5'}>
      <Progress value={pct} className="h-2" />
      <p className="text-xs text-center text-muted-foreground font-medium">
        {label ?? `${pct}%`}
      </p>
    </div>
  );
}
