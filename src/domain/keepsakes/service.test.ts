import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_KEEPSAKE_ITEMS, MAX_KEEPSAKE_LENGTH } from "@/lib/constants";
import { addKeepsake, exportKeepsakes, importKeepsakes, removeKeepsake } from "./service";
import type { KeepsakeRecord } from "./types";

afterEach(() => vi.unstubAllGlobals());

const note = (n: number, day = n): KeepsakeRecord => ({
  id: `n${n}`,
  text: `note ${n}`,
  createdAt: `2026-03-${String(day).padStart(2, "0")}T00:00:00.000Z`,
  mood: "soft",
});
const full = () => Array.from({ length: MAX_KEEPSAKE_ITEMS }, (_, i) => note(i + 1)).reverse(); // newest first

describe("addKeepsake", () => {
  it("prepends a trimmed note", () => {
    const result = addKeepsake([note(1)], "  hello  ", "soft", new Date("2026-04-01T00:00:00Z"));
    expect(result.ok).toBe(true);
    expect(result.items.map((i) => i.text)).toEqual(["hello", "note 1"]);
    expect(result.items[0]?.createdAt).toBe("2026-04-01T00:00:00.000Z");
  });
  it("rejects blank and over-long text with a readable message", () => {
    const blank = addKeepsake([], "   ");
    expect(blank.ok).toBe(false);
    const long = addKeepsake([], "a".repeat(MAX_KEEPSAKE_LENGTH + 1));
    expect(long.ok).toBe(false);
  });
  it("refuses to add when the box is full and leaves the notes untouched", () => {
    const items = full();
    const result = addKeepsake(items, "one more");
    expect(result.ok).toBe(false);
    expect(result.items).toEqual(items);
  });
  it("works where crypto.randomUUID is unavailable (plain-http LAN testing)", () => {
    vi.stubGlobal("crypto", {});
    const a = addKeepsake([], "a");
    const b = addKeepsake(a.items, "b");
    expect(b.ok).toBe(true);
    expect(new Set(b.items.map((i) => i.id)).size).toBe(2);
  });
  it("does not mutate its input", () => {
    const items = [note(1)];
    addKeepsake(items, "x");
    expect(items).toHaveLength(1);
  });
});

describe("removeKeepsake", () => {
  it("removes by id only", () => {
    expect(removeKeepsake([note(1), note(2)], "n1").map((i) => i.id)).toEqual(["n2"]);
    expect(removeKeepsake([note(1)], "missing")).toHaveLength(1);
  });
});

describe("export / import", () => {
  it("round-trips", () => {
    const items = [note(2), note(1)];
    const result = importKeepsakes(exportKeepsakes(items), []);
    expect(result).toMatchObject({ ok: true, added: 2, skipped: 0, dropped: 0 });
    expect(result.items).toEqual(items);
  });
  it("is idempotent: importing the same backup twice adds nothing", () => {
    const items = [note(2), note(1)];
    const result = importKeepsakes(exportKeepsakes(items), items);
    expect(result).toMatchObject({ ok: true, added: 0, skipped: 2, dropped: 0 });
    expect(result.items).toHaveLength(2);
  });
  it("skips duplicates inside the imported file itself", () => {
    const raw = JSON.stringify({ schemaVersion: 1, exportedAt: "x", items: [note(1), note(1)] });
    expect(importKeepsakes(raw, [])).toMatchObject({ ok: true, added: 1, skipped: 1 });
  });
  it("orders the merge newest-first", () => {
    const result = importKeepsakes(exportKeepsakes([note(5)]), [note(9), note(1)]);
    expect(result.items.map((i) => i.id)).toEqual(["n9", "n5", "n1"]);
  });
  it("never discards the user's newer notes in favour of an older import", () => {
    const old: KeepsakeRecord = { id: "old", text: "ancient", createdAt: "2020-01-01T00:00:00.000Z", mood: "soft" };
    const result = importKeepsakes(exportKeepsakes([old]), full());
    expect(result).toMatchObject({ ok: true, added: 0, dropped: 1 });
    expect(result.items).toHaveLength(MAX_KEEPSAKE_ITEMS);
    expect(result.items.some((i) => i.id === "old")).toBe(false);
  });
  it("reports unreadable files without touching existing notes", () => {
    const existing = [note(1)];
    const result = importKeepsakes("{ not json", existing);
    expect(result.ok).toBe(false);
    expect(result.items).toEqual(existing);
  });
});
