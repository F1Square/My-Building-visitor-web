import { describe, expect, it } from "vitest";
import {
  INDIA_STATES,
  getCitiesForState,
  isValidStateCity,
  validateImageDataUrl,
  MAX_LOGO_BYTES,
} from "@/data/indiaLocations";

describe("indiaLocations", () => {
  it("includes all major states and puts Gujarat before city options", () => {
    expect(INDIA_STATES).toContain("Gujarat");
    expect(INDIA_STATES).toContain("Maharashtra");
    expect(INDIA_STATES).toContain("Delhi");
    expect(INDIA_STATES).toContain("Ladakh");
    expect(getCitiesForState("Gujarat")).toContain("Surat");
    expect(getCitiesForState("Maharashtra")).not.toContain("Surat");
  });

  it("validates state/city pairs", () => {
    expect(isValidStateCity("Gujarat", "Surat")).toBe(true);
    expect(isValidStateCity("Gujarat", "Mumbai")).toBe(false);
    expect(isValidStateCity("Nowhere", "Anywhere")).toBe(false);
  });

  it("accepts common image formats and rejects invalid or oversized files", () => {
    expect(validateImageDataUrl("data:text/plain;base64,abc").ok).toBe(false);
    expect(validateImageDataUrl("data:image/png;base64,").ok).toBe(false);

    const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    expect(validateImageDataUrl(tinyPng).ok).toBe(true);
    expect(validateImageDataUrl("data:image/jpeg;base64,/9j/AAAA").ok).toBe(true);
    expect(validateImageDataUrl("data:image/gif;base64,R0lGODlhAQABAAAAACw=").ok).toBe(true);

    const huge = `data:image/png;base64,${"iVBORw0KGgo"}${"A".repeat(Math.ceil((MAX_LOGO_BYTES * 4) / 3) + 16)}`;
    expect(validateImageDataUrl(huge).ok).toBe(false);
  });
});
