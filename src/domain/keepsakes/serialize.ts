import { MAX_IMPORT_BYTES, MAX_KEEPSAKE_ITEMS, MAX_KEEPSAKE_LENGTH } from "@/lib/constants";
import { clipText } from "@/lib/utils/text";
import type { KeepsakeExport, KeepsakeMood, KeepsakeRecord } from "./types";

const ID_PATTERN = /^[\w-]{1,80}$/;

export function createKeepsakeExport(items: readonly KeepsakeRecord[], now = new Date()): KeepsakeExport {
  return { schemaVersion: 1, exportedAt: now.toISOString(), items: items.slice(0, MAX_KEEPSAKE_ITEMS) };
}

/**
 * Turns untrusted data (localStorage, an imported file) into valid records.
 * - Accepts the legacy shape `{ id, text, date }` written by earlier versions, so nothing is lost on upgrade.
 * - Drops entries without text, clamps length, normalizes Unicode and timestamps.
 * - De-duplicates by id and by content; if an id is reused for different content the entry is re-keyed, not lost.
 */
export function sanitizeKeepsakeItems(input: unknown, options: { limit?: number; now?: Date } = {}): KeepsakeRecord[] {
  if (!Array.isArray(input)) return [];
  const limit = options.limit ?? MAX_KEEPSAKE_ITEMS;
  const now = options.now ?? new Date();
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  const result: KeepsakeRecord[] = [];

  for (const raw of input) {
    if (result.length >= limit) break;
    const record = toRecord(raw, now);
    if (!record) continue;
    const content = contentKey(record);
    if (seenContent.has(content)) continue;
    const unique = seenIds.has(record.id) ? { ...record, id: fallbackId(record) } : record;
    seenIds.add(unique.id);
    seenContent.add(content);
    result.push(unique);
  }
  return result;
}

export type ParsedKeepsakeExport = { items: KeepsakeRecord[]; rejected: number };

export function parseKeepsakeExport(raw: string): ParsedKeepsakeExport {
  if (raw.length > MAX_IMPORT_BYTES) throw new Error("Tệp quá lớn để là bản sao lưu của hộp kỷ niệm.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Tệp không phải JSON hợp lệ.");
  }
  if (!parsed || typeof parsed !== "object" || !("schemaVersion" in parsed) || !("items" in parsed)) {
    throw new Error("Tệp không đúng định dạng hộp kỷ niệm.");
  }
  const payload = parsed as { schemaVersion?: unknown; items?: unknown };
  if (payload.schemaVersion !== 1 || !Array.isArray(payload.items)) throw new Error("Phiên bản tệp chưa được hỗ trợ.");
  const items = sanitizeKeepsakeItems(payload.items, { limit: Number.POSITIVE_INFINITY });
  return { items, rejected: payload.items.length - items.length };
}

export function contentKey(record: Pick<KeepsakeRecord, "createdAt" | "text">): string {
  return `${record.createdAt}\u0000${record.text}`;
}

function toRecord(raw: unknown, now: Date): KeepsakeRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.text !== "string") return null;
  const text = clipText(candidate.text.normalize("NFC").trim(), MAX_KEEPSAKE_LENGTH).trimEnd();
  if (!text) return null;
  const createdAt = toIso(candidate.createdAt) ?? toIso(candidate.date) ?? now.toISOString();
  const id = typeof candidate.id === "string" && ID_PATTERN.test(candidate.id) ? candidate.id : fallbackId({ createdAt, text });
  return { id, text, createdAt, mood: toMood(candidate.mood) };
}

function toMood(value: unknown): KeepsakeMood {
  return value === "happy" || value === "grateful" ? value : "soft";
}

function toIso(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

/** Deterministic id derived from content, so importing the same file twice is idempotent. */
function fallbackId(record: Pick<KeepsakeRecord, "createdAt" | "text">): string {
  return `k-${Date.parse(record.createdAt).toString(36)}-${hash(record.text)}`;
}

function hash(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i += 1) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
