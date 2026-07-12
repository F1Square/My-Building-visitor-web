type BrandLogoProps = {
  /** Icon box size in pixels (Tailwind-friendly via className preferred). */
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

const SIZE_CLASS = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
} as const;

export function BrandLogo({
  size = "md", 
  showWordmark = true,
  className = "",
  wordmarkClassName = "text-xl font-bold font-['Plus_Jakarta_Sans']",
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/app-icon.png"
        alt={showWordmark ? "" : "MyBuilding"}
        width={64}
        height={64}
        className={`${SIZE_CLASS[size]} rounded-xl object-contain bg-white shrink-0`}
        decoding="async"
      />
      {showWordmark && (
        <span className={wordmarkClassName}>MyBuilding</span>
      )}
    </span>
  );
}
