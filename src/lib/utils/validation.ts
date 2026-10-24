import { MAX_KEEPSAKE_LENGTH, MAX_SEARCH_LENGTH, MEMORY_CATEGORY_VALUES } from "@/lib/constants";
import { clipText } from "@/lib/utils/text";
import type { MemoryCategory } from "@/domain/memories/types";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

export function validateNote(value: unknown): ValidationResult<string> {
  if (typeof value !== "string") return { ok: false, errors: ["Nội dung phải là văn bản."] };
  const text = value.normalize("NFC").trim();
  if (!text) return { ok: false, errors: ["Hãy viết một điều muốn lưu giữ."] };
  if (text.length > MAX_KEEPSAKE_LENGTH) return { ok: false, errors: [`Nội dung tối đa ${MAX_KEEPSAKE_LENGTH} ký tự.`] };
  return { ok: true, value: text };
}

export function validateSearchQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return clipText(value.normalize("NFC").trim(), MAX_SEARCH_LENGTH);
}

export function isValidCategory(value: unknown): value is MemoryCategory {
  return value === "all" || (MEMORY_CATEGORY_VALUES as readonly unknown[]).includes(value);
}

export function validateId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(id) ? id : null;
}
