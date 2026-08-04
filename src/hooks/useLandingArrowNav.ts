import { useEffect } from "react";
import { LANDING_SECTION_IDS } from "@/components/landing/landingSections";

const NAV_OFFSET_PX = 72;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  if (target.closest('[role="listbox"], [role="menu"], [role="combobox"]')) return true;
  return false;
}

function sectionTop(id: string): number | null {
  const el = document.getElementById(id);
  if (!el) return null;
  return el.getBoundingClientRect().top + window.scrollY;
}

function currentSectionIndex(): number {
  const y = window.scrollY + NAV_OFFSET_PX + 8;
  let idx = 0;
  for (let i = 0; i < LANDING_SECTION_IDS.length; i++) {
    const top = sectionTop(LANDING_SECTION_IDS[i]);
    if (top == null) continue;
    if (top <= y) idx = i;
  }
  return idx;
}

function scrollToSection(id: string) {
  const top = sectionTop(id);
  if (top == null) return;
  window.scrollTo({
    top: Math.max(0, top - NAV_OFFSET_PX),
    behavior: "smooth",
  });
}

/**
 * Landing-only: ArrowDown → next section, ArrowUp → previous.
 * Skips while typing in form fields so Contact / Register stay usable.
 */
export function useLandingArrowNav(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (isTypingTarget(e.target)) return;

      const idx = currentSectionIndex();
      const nextIdx =
        e.key === "ArrowDown"
          ? Math.min(LANDING_SECTION_IDS.length - 1, idx + 1)
          : Math.max(0, idx - 1);

      if (nextIdx === idx) return;

      e.preventDefault();
      scrollToSection(LANDING_SECTION_IDS[nextIdx]);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
