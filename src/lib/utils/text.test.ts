import { describe, expect, it } from "vitest";
import { clipText, foldForSearch, normalizeForCompare } from "./text";

describe("foldForSearch", () => {
  it("removes Vietnamese diacritics and lowercases", () => {
    expect(foldForSearch("Hẹn hò")).toBe("hen ho");
    expect(foldForSearch("Ngày mọi thứ bắt đầu")).toBe("ngay moi thu bat dau");
  });
  it("folds đ/Đ, which has no Unicode decomposition", () => {
    expect(foldForSearch("Đà Lạt")).toBe("da lat");
    expect(foldForSearch("đi")).toBe("di");
  });
  it("gives the same result for NFC and NFD input", () => {
    const nfc = "hẹn hò".normalize("NFC");
    const nfd = "hẹn hò".normalize("NFD");
    expect(nfd).not.toBe(nfc);
    expect(foldForSearch(nfd)).toBe(foldForSearch(nfc));
  });
  it("collapses whitespace", () => {
    expect(foldForSearch("  a \n  b\t")).toBe("a b");
  });
});

describe("normalizeForCompare", () => {
  it("keeps diacritics but makes NFC/NFD equal", () => {
    expect(normalizeForCompare("Hẹn Hò".normalize("NFD"))).toBe("hẹn hò");
    expect(normalizeForCompare("a")).not.toBe(normalizeForCompare("á"));
  });
});

describe("clipText", () => {
  it("returns short strings untouched", () => {
    expect(clipText("abc", 10)).toBe("abc");
  });
  it("truncates to the limit", () => {
    expect(clipText("abcdef", 3)).toBe("abc");
    expect(clipText("abc", 0)).toBe("");
  });
  it("never leaves half an emoji behind", () => {
    const clipped = clipText("ab😀", 3); // 😀 is two UTF-16 units
    expect(clipped).toBe("ab");
    expect(() => encodeURIComponent(clipped)).not.toThrow();
  });
});
