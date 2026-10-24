import { APP_TIME_ZONE } from "@/lib/constants";

const DAY_MS = 86_400_000;
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export type Ymd = { year: number; month: number; day: number };

/** Strict YYYY-MM-DD parser. Rejects impossible dates such as 2026-02-31 instead of rolling them over. */
export function parseYmd(value: string): Ymd | null {
  const match = YMD.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  const valid = probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
  return valid ? { year, month, day } : null;
}

/** Today's calendar date as YYYY-MM-DD in the given zone (default: Vietnam). */
export function ymdInTimeZone(now: Date, timeZone: string = APP_TIME_ZONE): string {
  // The "en-CA" locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function utcDay({ year, month, day }: Ymd): number {
  return Date.UTC(year, month - 1, day);
}

/**
 * Whole calendar days from `startYmd` to today (in `timeZone`).
 * Returns null for a missing/invalid date or a start date in the future, so callers can hide the counter.
 */
export function daysSinceYmd(startYmd: string | undefined, now: Date = new Date(), timeZone: string = APP_TIME_ZONE): number | null {
  if (!startYmd) return null;
  const start = parseYmd(startYmd);
  const today = parseYmd(ymdInTimeZone(now, timeZone));
  if (!start || !today) return null;
  const days = Math.round((utcDay(today) - utcDay(start)) / DAY_MS);
  return days >= 0 ? days : null;
}

const NOTE_DATE = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "short", year: "numeric", timeZone: APP_TIME_ZONE });

/** Formats an ISO timestamp for display; returns "" instead of throwing on bad input. */
export function formatNoteDate(iso: string): string {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? "" : NOTE_DATE.format(new Date(time));
}
