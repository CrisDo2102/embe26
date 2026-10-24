import { MAX_KEEPSAKE_ITEMS } from "@/lib/constants";
import { validateNote } from "@/lib/utils/validation";
import { contentKey, createKeepsakeExport, parseKeepsakeExport } from "./serialize";
import type { KeepsakeMood, KeepsakeRecord } from "./types";

export type KeepsakeOperationResult =
  | { ok: true; items: KeepsakeRecord[] }
  | { ok: false; items: KeepsakeRecord[]; message: string };

export type KeepsakeImportResult =
  | { ok: true; items: KeepsakeRecord[]; added: number; skipped: number; dropped: number }
  | { ok: false; items: KeepsakeRecord[]; message: string };

export function addKeepsake(
  items: readonly KeepsakeRecord[],
  rawText: unknown,
  mood: KeepsakeMood = "soft",
  now = new Date(),
): KeepsakeOperationResult {
  const validated = validateNote(rawText);
  const current = [...items];
  if (!validated.ok) return { ok: false, items: current, message: validated.errors[0] ?? "Nội dung chưa hợp lệ." };
  if (current.length >= MAX_KEEPSAKE_ITEMS) {
    return { ok: false, items: current, message: "Chiếc hộp đã đầy. Hãy xóa một ghi chú trước nhé." };
  }
  const record: KeepsakeRecord = { id: createId(now), text: validated.value, createdAt: now.toISOString(), mood };
  return { ok: true, items: [record, ...current] };
}

export function removeKeepsake(items: readonly KeepsakeRecord[], id: string): KeepsakeRecord[] {
  return items.filter((item) => item.id !== id);
}

export function exportKeepsakes(items: readonly KeepsakeRecord[], now = new Date()): string {
  return JSON.stringify(createKeepsakeExport(items, now), null, 2);
}

/**
 * Merges a backup into the current notes without ever overwriting or silently losing newer notes:
 * duplicates are skipped, the merged list is ordered newest-first, and only the OLDEST notes beyond
 * the capacity are dropped (and reported via `dropped`).
 */
export function importKeepsakes(raw: string, existing: readonly KeepsakeRecord[]): KeepsakeImportResult {
  const current = [...existing];
  try {
    const { items: incoming, rejected } = parseKeepsakeExport(raw);
    const knownIds = new Set(current.map((item) => item.id));
    const knownContent = new Set(current.map(contentKey));
    const fresh = incoming.filter((item) => !knownIds.has(item.id) && !knownContent.has(contentKey(item)));

    const merged = [...fresh, ...current].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    const kept = merged.slice(0, MAX_KEEPSAKE_ITEMS);
    const keptIds = new Set(kept.map((item) => item.id));
    return {
      ok: true,
      items: kept,
      added: fresh.filter((item) => keptIds.has(item.id)).length,
      skipped: rejected + (incoming.length - fresh.length),
      dropped: merged.length - kept.length,
    };
  } catch (error) {
    return { ok: false, items: current, message: error instanceof Error ? error.message : "Không thể đọc tệp này." };
  }
}

/** `crypto.randomUUID` only exists in secure contexts (https/localhost), so it must be guarded. */
function createId(date: Date): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `keepsake-${uuid}`;
  return `keepsake-${date.getTime().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
