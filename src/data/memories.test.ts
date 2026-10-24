import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MEMORY_CATEGORY_VALUES } from "@/lib/constants";
import { validateId } from "@/lib/utils/validation";
import { cover, littleNotes, memories, photos, reasons } from "./memories";

/** Reads width/height from a JPEG's SOFn marker, so the test needs no image library. */
function jpegSize(path: string): { width: number; height: number } {
  const buffer = readFileSync(path);
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error(`Not a JPEG marker at ${offset} in ${path}`);
    const marker = buffer[offset + 1] ?? 0;
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error(`No SOF marker in ${path}`);
}
const publicFile = (src: string) => join(process.cwd(), "public", src);

describe("memories content", () => {
  it("has unique, URL-safe ids", () => {
    const ids = memories.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(validateId(id)).toBe(id);
  });
  it("uses only known categories and has no blank fields", () => {
    for (const m of memories) {
      expect(MEMORY_CATEGORY_VALUES).toContain(m.category);
      expect(m.title.trim()).not.toBe("");
      expect(m.description.trim()).not.toBe("");
    }
  });
  it("has copy for the letter widgets", () => {
    expect(reasons.length).toBeGreaterThan(0);
    expect(littleNotes.length).toBeGreaterThan(0);
  });
});

describe("photo assets", () => {
  it.each([cover, ...photos].map((p) => [p.src, p] as const))("%s exists and its declared size matches the file", (src, photo) => {
    expect(existsSync(publicFile(src))).toBe(true);
    expect(jpegSize(publicFile(src))).toEqual({ width: photo.width, height: photo.height });
  });
  it("has unique sources", () => {
    expect(new Set(photos.map((p) => p.src)).size).toBe(photos.length);
  });
});
