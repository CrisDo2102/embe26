"use client";
import { useCallback, useSyncExternalStore } from "react";
import { addKeepsake, exportKeepsakes, importKeepsakes, removeKeepsake } from "@/domain/keepsakes/service";
import type { KeepsakeImportResult, KeepsakeOperationResult } from "@/domain/keepsakes/service";
import { keepsakeStore, type KeepsakeStore, type StorageStatus } from "@/lib/storage/keepsake-store";

/** Every operation reads the latest snapshot at call time, so it can never act on stale closure state. */
export function useKeepsakes(store: KeepsakeStore = keepsakeStore) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const add = useCallback(
    (text: string): KeepsakeOperationResult & { persisted: StorageStatus } => {
      const result = addKeepsake(store.getSnapshot().items, text);
      const persisted = result.ok ? store.save(result.items) : store.getSnapshot().status;
      return { ...result, persisted };
    },
    [store],
  );
  const remove = useCallback((id: string) => store.save(removeKeepsake(store.getSnapshot().items, id)), [store]);
  const exportJson = useCallback(() => exportKeepsakes(store.getSnapshot().items), [store]);
  const importJson = useCallback(
    (raw: string): KeepsakeImportResult & { persisted: StorageStatus } => {
      const result = importKeepsakes(raw, store.getSnapshot().items);
      const persisted = result.ok ? store.save(result.items) : store.getSnapshot().status;
      return { ...result, persisted };
    },
    [store],
  );

  return { items: snapshot.items, status: snapshot.status, add, remove, exportJson, importJson };
}
