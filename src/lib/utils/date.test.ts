import { describe, expect, it } from "vitest";
import { daysSinceYmd, formatNoteDate, parseYmd, ymdInTimeZone } from "./date";

describe("parseYmd", () => {
  it("accepts real dates, including leap days", () => {
    expect(parseYmd("2026-10-14")).toEqual({ year: 2026, month: 10, day: 14 });
    expect(parseYmd("2024-02-29")).not.toBeNull();
  });
  it.each(["2026-02-31", "2025-02-29", "2026-13-01", "2026-00-10", "2026-1-1", "", "abcd-ef-gh", "2026-10-14T00:00"])(
    "rejects %j instead of rolling it over",
    (value) => expect(parseYmd(value)).toBeNull(),
  );
});

describe("ymdInTimeZone", () => {
  it("uses the Vietnam calendar day, not the UTC one", () => {
    expect(ymdInTimeZone(new Date("2026-10-14T16:59:59Z"))).toBe("2026-10-14"); // 23:59:59 in Hà Nội
    expect(ymdInTimeZone(new Date("2026-10-14T17:00:00Z"))).toBe("2026-10-15"); // 00:00:00 next day
  });
});

describe("daysSinceYmd", () => {
  const now = new Date("2026-10-14T05:00:00Z");
  it("counts whole calendar days", () => {
    expect(daysSinceYmd("2026-10-01", now)).toBe(13);
    expect(daysSinceYmd("2026-10-14", now)).toBe(0);
    expect(daysSinceYmd("2025-10-14", now)).toBe(365);
  });
  it("rolls over exactly at midnight Vietnam time", () => {
    expect(daysSinceYmd("2026-10-14", new Date("2026-10-13T17:00:00Z"))).toBe(0);
    expect(daysSinceYmd("2026-10-14", new Date("2026-10-13T16:59:59Z"))).toBeNull(); // still the 13th
  });
  it("returns null for missing, invalid or future dates", () => {
    expect(daysSinceYmd(undefined, now)).toBeNull();
    expect(daysSinceYmd("", now)).toBeNull();
    expect(daysSinceYmd("2026-02-31", now)).toBeNull();
    expect(daysSinceYmd("2030-01-01", now)).toBeNull();
  });
});

describe("formatNoteDate", () => {
  it("formats a valid timestamp", () => {
    expect(formatNoteDate("2026-03-05T10:00:00.000Z")).toContain("2026");
  });
  it("returns an empty string instead of throwing on garbage", () => {
    expect(formatNoteDate("not a date")).toBe("");
    expect(formatNoteDate("")).toBe("");
  });
});
