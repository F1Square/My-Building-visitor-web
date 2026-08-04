/** Shared landing-page anchors — used by Navbar + arrow-key section nav. */
export const LANDING_NAV_LINKS = [
  { label: "App Demo", href: "#app-demo" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

/** Top-to-bottom section order for ↑ / ↓ navigation (includes hero). */
export const LANDING_SECTION_IDS = [
  "hero",
  ...LANDING_NAV_LINKS.map((l) => l.href.slice(1)),
] as const;
