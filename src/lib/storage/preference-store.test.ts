// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createBooleanPreference } from "./preference-store";

const KEY = "test-pref";
afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("createBooleanPreference", () => {
  it("defaults to false on server and client", () => {
    const pref = createBooleanPreference(() => window.localStorage, KEY);
    expect(pref.getServerSnapshot()).toBe(false);
    expect(pref.getSnapshot()).toBe(false);
  });
  it("persists and notifies", () => {
    const pref = createBooleanPreference(() => window.localStorage, KEY);
    const listener = vi.fn();
    const off = pref.subscribe(listener);
    pref.set(true);
    expect(pref.getSnapshot()).toBe(true);
    expect(window.localStorage.getItem(KEY)).toBe("1");
    pref.set(false);
    expect(window.localStorage.getItem(KEY)).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    off();
  });
  it("still works for this session if the browser refuses to persist", () => {
    const pref = createBooleanPreference(() => window.localStorage, KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    pref.set(true);
    expect(pref.getSnapshot()).toBe(true);
  });
  it("follows changes made in another tab and ignores unrelated keys", () => {
    const pref = createBooleanPreference(() => window.localStorage, KEY);
    const listener = vi.fn();
    const off = pref.subscribe(listener);
    window.localStorage.setItem(KEY, "1");
    window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    expect(listener).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    expect(listener).toHaveBeenCalledOnce();
    expect(pref.getSnapshot()).toBe(true);
    off();
  });
  it("is false (not a crash) when storage cannot even be accessed", () => {
    const pref = createBooleanPreference(() => {
      throw new DOMException("denied", "SecurityError");
    }, KEY);
    expect(pref.getSnapshot()).toBe(false);
    expect(() => pref.set(true)).not.toThrow();
  });
});
