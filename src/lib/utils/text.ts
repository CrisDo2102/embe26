const COMBINING_MARKS = /\p{M}/gu;
const WHITESPACE = /\s+/g;

/**
 * Comparison form that keeps diacritics: NFC + lowercase + collapsed spaces.
 * NFC matters because macOS/iOS keyboards and pasted text often arrive as NFD
 * ("o" + combining mark), which would otherwise never equal the stored NFC text.
 */
export function normalizeForCompare(value: string): string {
  return value.normalize("NFC").toLocaleLowerCase("vi").replace(WHITESPACE, " ").trim();
}

/**
 * Accent-insensitive form so "hen ho" finds "hẹn hò" and "da lat" finds "Đà Lạt".
 * "đ" has no Unicode decomposition, so it needs its own replacement.
 */
export function foldForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/đ/gi, "d")
    .toLocaleLowerCase("vi")
    .replace(WHITESPACE, " ")
    .trim();
}

/** Truncate to `max` UTF-16 units without leaving half of an emoji (a lone surrogate) behind. */
export function clipText(value: string, max: number): string {
  if (value.length <= max) return value;
  const clipped = value.slice(0, Math.max(0, max));
  const last = clipped.charCodeAt(clipped.length - 1);
  return last >= 0xd800 && last <= 0xdbff ? clipped.slice(0, -1) : clipped;
}
