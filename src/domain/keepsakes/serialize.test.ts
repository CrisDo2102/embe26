import { describe, expect, it } from "vitest";
import { MAX_IMPORT_BYTES, MAX_KEEPSAKE_ITEMS, MAX_KEEPSAKE_LENGTH } from "@/lib/constants";
import { createKeepsakeExport, parseKeepsakeExport, sanitizeKeepsakeItems } from "./serialize";

const AT = "2026-01-01T00:00:00.000Z";
const file = (items: unknown[], schemaVersion: unknown = 1) => JSON.stringify({ schemaVersion, exportedAt: AT, items });

describe("sanitizeKeepsakeItems", () => {
  it("migrates the legacy shape { id, text, date } written by earlier versions", () => {
    const [item] = sanitizeKeepsakeItems([{ id: "abc-123", text: "xin chào", date: "2025-12-24T10:00:00Z" }]);
    expect(item).toEqual({ id: "abc-123", text: "xin chào", createdAt: "2025-12-24T10:00:00.000Z", mood: "soft" });
  });
  it("returns [] for non-arrays and for entries that are not usable", () => {
    expect(sanitizeKeepsakeItems({ hello: "world" })).toEqual([]);
    expect(sanitizeKeepsakeItems(null)).toEqual([]);
    expect(sanitizeKeepsakeItems("text")).toEqual([]);
    expect(sanitizeKeepsakeItems([null, 42, "x", { text: 5 }, { text: "   " }, {}])).toEqual([]);
  });
  it("normalizes text to NFC and clamps its length", () => {
    const nfd = "hẹn hò".normalize("NFD");
    expect(sanitizeKeepsakeItems([{ text: nfd, createdAt: AT }])[0]?.text).toBe("hẹn hò".normalize("NFC"));
    expect(sanitizeKeepsakeItems([{ text: "a".repeat(999), createdAt: AT }])[0]?.text).toHaveLength(MAX_KEEPSAKE_LENGTH);
  });
  it("repairs a missing or invalid timestamp and unknown mood", () => {
    const now = new Date("2026-05-05T00:00:00Z");
    const [item] = sanitizeKeepsakeItems([{ text: "a", createdAt: "nope", mood: "angry" }], { now });
    expect(item?.createdAt).toBe(now.toISOString());
    expect(item?.mood).toBe("soft");
  });
  it("keeps a valid mood", () => {
    expect(sanitizeKeepsakeItems([{ text: "a", createdAt: AT, mood: "grateful" }])[0]?.mood).toBe("grateful");
  });
  it("gives distinct ids to distinct notes that share a timestamp and length", () => {
    const items = sanitizeKeepsakeItems([{ text: "aaaa", createdAt: AT }, { text: "bbbb", createdAt: AT }]);
    expect(new Set(items.map((i) => i.id)).size).toBe(2);
  });
  it("derives the same id for the same content (idempotent imports)", () => {
    const a = sanitizeKeepsakeItems([{ text: "same", createdAt: AT }]);
    const b = sanitizeKeepsakeItems([{ text: "same", createdAt: AT }]);
    expect(a[0]?.id).toBe(b[0]?.id);
  });
  it("drops exact duplicates but re-keys a reused id with different content", () => {
    const items = sanitizeKeepsakeItems([
      { id: "dup", text: "one", createdAt: AT },
      { id: "dup", text: "one", createdAt: AT },
      { id: "dup", text: "two", createdAt: AT },
    ]);
    expect(items.map((i) => i.text)).toEqual(["one", "two"]);
    expect(new Set(items.map((i) => i.id)).size).toBe(2);
  });
  it("caps at the keepsake limit by default and honours an explicit limit", () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ text: `note ${i}`, createdAt: AT }));
    expect(sanitizeKeepsakeItems(many)).toHaveLength(MAX_KEEPSAKE_ITEMS);
    expect(sanitizeKeepsakeItems(many, { limit: Number.POSITIVE_INFINITY })).toHaveLength(50);
  });
});

describe("parseKeepsakeExport", () => {
  it("parses a valid file and counts rejected entries", () => {
    const parsed = parseKeepsakeExport(file([{ text: "ok", createdAt: AT }, { text: "" }, 7]));
    expect(parsed.items).toHaveLength(1);
    expect(parsed.rejected).toBe(2);
  });
  it.each([
    ["not json", "{"],
    ["a JSON array", "[]"],
    ["a missing items key", JSON.stringify({ schemaVersion: 1 })],
    ["an unsupported version", file([], 2)],
    ["non-array items", JSON.stringify({ schemaVersion: 1, items: {} })],
  ])("throws a readable error for %s", (_label, raw) => {
    expect(() => parseKeepsakeExport(raw)).toThrow(/Tệp|JSON|Phiên bản/);
  });
  it("refuses oversized input before parsing it", () => {
    expect(() => parseKeepsakeExport(" ".repeat(MAX_IMPORT_BYTES + 1))).toThrow(/quá lớn/);
  });
});

describe("createKeepsakeExport", () => {
  it("stamps the schema version and caps the items", () => {
    const items = Array.from({ length: 40 }, (_, i) => ({ id: `k${i}`, text: "t", createdAt: AT, mood: "soft" as const }));
    const out = createKeepsakeExport(items, new Date(AT));
    expect(out).toMatchObject({ schemaVersion: 1, exportedAt: AT });
    expect(out.items).toHaveLength(MAX_KEEPSAKE_ITEMS);
  });
});
