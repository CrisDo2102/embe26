// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createKeepsakeStore } from "./keepsake-store";
import type { KeepsakeRecord } from "@/domain/keepsakes/types";

const KEY = "test-keepsakes";
const rec = (n: number): KeepsakeRecord => ({ id: `n${n}`, text: `note ${n}`, createdAt: `2026-01-0${n}T00:00:00.000Z`, mood: "soft" });
const store = () => createKeepsakeStore(() => window.localStorage, KEY);

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("reading", () => {
  it("starts empty", () => {
    expect(store().getSnapshot()).toEqual({ items: [], status: "ok" });
  });
  it("reads saved notes, including the legacy { id, text, date } shape", () => {
    window.localStorage.setItem(KEY, JSON.stringify([{ id: "old-1", text: "legacy", date: "2025-12-24T10:00:00Z" }]));
    expect(store().getSnapshot().items).toEqual([
      { id: "old-1", text: "legacy", createdAt: "2025-12-24T10:00:00.000Z", mood: "soft" },
    ]);
  });
  it.each([
    ["wrong shape", JSON.stringify({ hello: "world" })],
    ["wrong item shapes", JSON.stringify([null, 42, { text: 5 }])],
    ["corrupt JSON", "{oops"],
  ])("survives %s", (_label, raw) => {
    window.localStorage.setItem(KEY, raw);
    expect(store().getSnapshot()).toEqual({ items: [], status: "ok" });
  });
  it("returns a referentially stable snapshot until storage changes (required by useSyncExternalStore)", () => {
    window.localStorage.setItem(KEY, JSON.stringify([rec(1)]));
    const s = store();
    expect(s.getSnapshot()).toBe(s.getSnapshot());
  });
  it("serves an empty server snapshot", () => {
    expect(store().getServerSnapshot()).toEqual({ items: [], status: "ok" });
  });
});

describe("saving", () => {
  it("persists, updates the snapshot and notifies subscribers", () => {
    const s = store();
    const listener = vi.fn();
    const unsubscribe = s.subscribe(listener);
    expect(s.save([rec(1)])).toBe("ok");
    expect(listener).toHaveBeenCalledOnce();
    expect(s.getSnapshot().items).toEqual([rec(1)]);
    expect(JSON.parse(window.localStorage.getItem(KEY) as string)).toEqual([rec(1)]);
    unsubscribe();
  });
  it("keeps notes in memory and reports 'quota' when the browser refuses to write", () => {
    const s = store();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(s.save([rec(1)])).toBe("quota");
    expect(s.getSnapshot()).toEqual({ items: [rec(1)], status: "quota" });
  });
  it("recovers once writing works again", () => {
    const s = store();
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    s.save([rec(1)]);
    spy.mockRestore();
    expect(s.save([rec(1), rec(2)])).toBe("ok");
    expect(s.getSnapshot().status).toBe("ok");
  });
  it("works when storage is completely blocked (touching it throws)", () => {
    const s = createKeepsakeStore(() => {
      throw new DOMException("denied", "SecurityError");
    }, KEY);
    expect(s.getSnapshot()).toEqual({ items: [], status: "unavailable" });
    expect(s.save([rec(1)])).toBe("unavailable");
    expect(s.getSnapshot()).toEqual({ items: [rec(1)], status: "unavailable" });
  });
});

describe("cross-tab sync", () => {
  it("re-reads and notifies when another tab changes the key, and ignores other keys", () => {
    const s = store();
    const listener = vi.fn();
    const unsubscribe = s.subscribe(listener);
    window.localStorage.setItem(KEY, JSON.stringify([rec(2)]));
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    expect(listener).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    expect(listener).toHaveBeenCalledOnce();
    expect(s.getSnapshot().items).toEqual([rec(2)]);
    unsubscribe();
  });
  it("removes its window listener when the last subscriber leaves", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const unsubscribe = store().subscribe(() => undefined);
    unsubscribe();
    expect(remove).toHaveBeenCalledWith("storage", expect.any(Function));
  });
});
