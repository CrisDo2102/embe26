import { describe, expect, it } from "vitest";
import { isDomainError } from "./errors";
import type { MemoryRepository } from "./repository";
import { MemoryService, memoryService } from "./service";
import type { MemoryRecord } from "./types";

const find = (items: MemoryRecord[], id: string) => items.find((item) => item.id === id);

describe("memoryService.list (real content)", () => {
  it("returns every memory when there is no filter", async () => {
    const all = await memoryService.list();
    expect(all.map((item) => item.id)).toEqual(["memory-1", "memory-2", "memory-3", "memory-4"]);
  });
  it("treats a whitespace-only query as no query", async () => {
    expect(await memoryService.list({ query: "   ", category: "all" })).toHaveLength(4);
  });
  it("filters by category", async () => {
    expect((await memoryService.list({ query: "", category: "dates" })).map((i) => i.id)).toEqual(["memory-2"]);
    expect(await memoryService.list({ query: "", category: "everyday" })).toHaveLength(3);
    expect(await memoryService.list({ query: "", category: "trips" })).toEqual([]);
  });
  it("finds Vietnamese typed in decomposed (NFD) form, as macOS/iOS keyboards emit it", async () => {
    const hits = await memoryService.list({ query: "hẹn hò".normalize("NFD"), category: "all" });
    expect(hits.map((i) => i.id)).toEqual(["memory-2"]);
  });
  it("finds Vietnamese typed without any diacritics", async () => {
    const hits = await memoryService.list({ query: "hen ho", category: "all" });
    expect(hits.map((i) => i.id)).toEqual(["memory-2"]);
  });
  it("matches words in any order", async () => {
    const hits = await memoryService.list({ query: "đầu buổi", category: "all" });
    expect(find(hits, "memory-2")).toBeDefined();
  });
  it("combines query and category", async () => {
    expect(await memoryService.list({ query: "hẹn hò", category: "everyday" })).toEqual([]);
  });
  it("returns nothing for a non-matching query", async () => {
    expect(await memoryService.list({ query: "zzzz", category: "all" })).toEqual([]);
  });
  it("hands out detached copies", async () => {
    const first = await memoryService.list();
    (first[0]?.tags as string[]).push("mutated");
    const second = await memoryService.list();
    expect(second[0]?.tags).not.toContain("mutated");
  });
});

describe("ranking", () => {
  const record = (id: string, title: string): MemoryRecord => ({ id, date: "", title, description: "", category: "everyday", tags: [] });
  const repository: MemoryRepository = {
    list: async () => [record("accented", "Dạ"), record("plain", "Da")],
    findById: async () => undefined,
  };
  it("ranks exact-accent matches above accent-folded matches", async () => {
    const hits = await new MemoryService(repository).list({ query: "da", category: "all" });
    expect(hits.map((h) => h.id)).toEqual(["plain", "accented"]);
  });
  it("keeps source order for equally ranked results", async () => {
    const hits = await new MemoryService(repository).list({ query: "", category: "all" });
    expect(hits.map((h) => h.id)).toEqual(["accented", "plain"]);
  });
});

describe("memoryService.get", () => {
  it("returns a record", async () => {
    expect((await memoryService.get("memory-2")).title).toBe("Buổi hẹn đầu tiên");
  });
  it("throws INVALID_INPUT for unsafe ids and NOT_FOUND for unknown ones", async () => {
    await expect(memoryService.get("../etc/passwd")).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(memoryService.get("memory-99")).rejects.toMatchObject({ code: "NOT_FOUND" });
    await memoryService.get("nope").catch((error) => expect(isDomainError(error)).toBe(true));
  });
});

describe("memoryService.categories", () => {
  it("lists only categories that contain records, with counts", async () => {
    expect(await memoryService.categories()).toEqual([
      { category: "dates", count: 1 },
      { category: "everyday", count: 3 },
    ]);
  });
});
