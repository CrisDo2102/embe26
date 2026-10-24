import { sanitizeKeepsakeItems } from "@/domain/keepsakes/serialize";
import type { KeepsakeRecord } from "@/domain/keepsakes/types";
import { KEEPSAKE_STORAGE_KEY } from "@/lib/constants";

/** `ok`: persisted. `quota`/`unavailable`: notes still work this session but will not survive a reload. */
export type StorageStatus = "ok" | "quota" | "unavailable";
export type KeepsakeSnapshot = { items: readonly KeepsakeRecord[]; status: StorageStatus };
export type KeepsakeStore = ReturnType<typeof createKeepsakeStore>;

const EMPTY: KeepsakeSnapshot = { items: [], status: "ok" };
const UNAVAILABLE: KeepsakeSnapshot = { items: [], status: "unavailable" };

/**
 * An external store for `useSyncExternalStore`. It never throws: browsers may block storage entirely
 * (some in-app webviews), refuse writes (quota), or hold data from an older version or hand-edited junk.
 * Snapshots are referentially stable until the underlying raw value changes.
 */
export function createKeepsakeStore(getStorage: () => Storage | null, key: string = KEEPSAKE_STORAGE_KEY) {
  let snapshot: KeepsakeSnapshot = EMPTY;
  let lastRaw: string | null | undefined; // undefined = never read
  let memoryOnly: KeepsakeSnapshot | null = null; // used while persistence is failing
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  function storage(): Storage | null {
    try {
      return getStorage(); // even touching window.localStorage can throw a SecurityError
    } catch {
      return null;
    }
  }

  function parse(raw: string): readonly KeepsakeRecord[] {
    try {
      return sanitizeKeepsakeItems(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  function read(): KeepsakeSnapshot {
    const area = storage();
    if (!area) return UNAVAILABLE;
    let raw: string | null;
    try {
      raw = area.getItem(key);
    } catch {
      return UNAVAILABLE;
    }
    if (lastRaw !== undefined && raw === lastRaw) return snapshot;
    lastRaw = raw;
    snapshot = raw === null ? EMPTY : { items: parse(raw), status: "ok" };
    return snapshot;
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== key) return;
    memoryOnly = null; // another tab changed the truth
    emit();
  }

  return {
    getSnapshot: (): KeepsakeSnapshot => memoryOnly ?? read(),
    getServerSnapshot: (): KeepsakeSnapshot => EMPTY,
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      if (listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    /** Persists the notes. On failure the notes are kept in memory so the UI keeps working, and the reason is returned. */
    save(items: readonly KeepsakeRecord[]): StorageStatus {
      const area = storage();
      if (!area) {
        memoryOnly = { items, status: "unavailable" };
        emit();
        return "unavailable";
      }
      try {
        const raw = JSON.stringify(items);
        area.setItem(key, raw);
        lastRaw = raw;
        snapshot = { items, status: "ok" };
        memoryOnly = null;
        emit();
        return "ok";
      } catch (error) {
        const status: StorageStatus = isQuotaError(error) ? "quota" : "unavailable";
        memoryOnly = { items, status };
        emit();
        return status;
      }
    },
  };
}

function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "QuotaExceededError" || error.code === 22);
}

export const keepsakeStore = createKeepsakeStore(() => window.localStorage);
