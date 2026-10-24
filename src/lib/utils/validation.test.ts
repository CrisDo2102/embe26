import { describe, expect, it } from "vitest";
import { MAX_KEEPSAKE_LENGTH, MAX_SEARCH_LENGTH } from "@/lib/constants";
import { isValidCategory, validateId, validateNote, validateSearchQuery } from "./validation";

describe("validateNote", () => {
  it("trims and normalizes to NFC", () => {
    const result = validateNote("  hẹn hò  ".normalize("NFD"));
    expect(result).toEqual({ ok: true, value: "hẹn hò".normalize("NFC") });
  });
  it("rejects non-strings, blank text and over-long text", () => {
    expect(validateNote(42).ok).toBe(false);
    expect(validateNote("   ").ok).toBe(false);
    expect(validateNote("a".repeat(MAX_KEEPSAKE_LENGTH)).ok).toBe(true);
    expect(validateNote("a".repeat(MAX_KEEPSAKE_LENGTH + 1)).ok).toBe(false);
  });
});

describe("validateSearchQuery", () => {
  it("normalizes, trims and clamps", () => {
    expect(validateSearchQuery("  hẹn ".normalize("NFD"))).toBe("hẹn".normalize("NFC"));
    expect(validateSearchQuery("x".repeat(500))).toHaveLength(MAX_SEARCH_LENGTH);
  });
  it("returns an empty string for non-strings", () => {
    expect(validateSearchQuery(null)).toBe("");
    expect(validateSearchQuery(undefined)).toBe("");
    expect(validateSearchQuery(["a"])).toBe("");
  });
});

describe("isValidCategory / validateId", () => {
  it("knows the categories", () => {
    for (const value of ["all", "dates", "everyday", "trips"]) expect(isValidCategory(value)).toBe(true);
    for (const value of ["", "ALL", "toString", "__proto__", null, 1]) expect(isValidCategory(value)).toBe(false);
  });
  it("accepts safe ids only", () => {
    expect(validateId("memory-1")).toBe("memory-1");
    expect(validateId(" memory-1 ")).toBe("memory-1");
    for (const value of ["", "../etc/passwd", "a b", "-leading", "x".repeat(81), null, 5]) expect(validateId(value)).toBeNull();
  });
});
