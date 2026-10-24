/** A tiny persisted boolean (e.g. "quiet mode") shaped for `useSyncExternalStore`. Never throws. */
export function createBooleanPreference(getStorage: () => Storage | null, key: string) {
  let memoryValue: boolean | null = null; // used if the browser refuses to persist
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  function read(): boolean {
    if (memoryValue !== null) return memoryValue;
    try {
      return getStorage()?.getItem(key) === "1";
    } catch {
      return false;
    }
  }
  function onStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== key) return;
    memoryValue = null;
    emit();
  }

  return {
    getSnapshot: read,
    getServerSnapshot: (): boolean => false,
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      if (listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    set(value: boolean): void {
      memoryValue = value;
      try {
        const area = getStorage();
        if (value) area?.setItem(key, "1");
        else area?.removeItem(key);
        memoryValue = null; // persisted successfully; storage is the source of truth again
      } catch {
        /* keep the in-memory value for this session */
      }
      emit();
    },
  };
}
