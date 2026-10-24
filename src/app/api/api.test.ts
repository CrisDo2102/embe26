import { afterEach, describe, expect, it, vi } from "vitest";
import { memoryService } from "@/domain/memories/service";
import { GET as getHealth } from "./health/route";
import { GET as getMemories } from "./memories/route";
import { GET as getMemory } from "./memories/[id]/route";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const list = (qs = "", headers?: HeadersInit) => getMemories(new Request(`http://localhost/api/memories${qs}`, { headers }));
const one = (id: string) => getMemory(new Request(`http://localhost/api/memories/${id}`), { params: Promise.resolve({ id }) });

describe("GET /api/memories", () => {
  it("returns every memory with a stable envelope", async () => {
    const response = await list();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(4);
    expect(body.meta).toEqual({ count: 4, query: "", category: "all" });
    expect(response.headers.get("cache-control")).toContain("max-age=30");
  });
  it("searches with and without diacritics, and with decomposed input", async () => {
    for (const q of ["hẹn hò", "hen ho", "hẹn hò".normalize("NFD")]) {
      const body = await (await list(`?q=${encodeURIComponent(q)}`)).json();
      expect(body.data.map((m: { id: string }) => m.id)).toEqual(["memory-2"]);
    }
  });
  it("filters by category and falls back to 'all' for unknown ones", async () => {
    expect((await (await list("?category=dates")).json()).meta.count).toBe(1);
    const unknown = await (await list("?category=bogus")).json();
    expect(unknown.meta.category).toBe("all");
    expect(unknown.meta.count).toBe(4);
  });
  it("clamps a very long query", async () => {
    const body = await (await list(`?q=${"x".repeat(1000)}`)).json();
    expect(body.meta.query).toHaveLength(120);
  });
  it("supports conditional requests (ETag → 304)", async () => {
    const first = await list("?q=hen");
    const etag = first.headers.get("etag") as string;
    expect(etag).toBeTruthy();
    const second = await list("?q=hen", { "if-none-match": etag });
    expect(second.status).toBe(304);
  });
  it("turns unexpected failures into a safe JSON 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(memoryService, "list").mockRejectedValue(new Error("db password is hunter2"));
    const response = await list();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).not.toContain("hunter2");
    expect(JSON.parse(text)).toEqual({ error: { code: "INTERNAL", message: "Máy chủ đang bận. Thử lại sau nhé." } });
  });
});

describe("GET /api/memories/:id", () => {
  it("returns one memory", async () => {
    const response = await one("memory-2");
    expect(response.status).toBe(200);
    expect((await response.json()).data.title).toBe("Buổi hẹn đầu tiên");
  });
  it("answers 404 for an unknown id and 400 for an unsafe one", async () => {
    const missing = await one("memory-99");
    expect(missing.status).toBe(404);
    expect((await missing.json()).error.code).toBe("NOT_FOUND");
    const unsafe = await one("a b");
    expect(unsafe.status).toBe(400);
    expect((await unsafe.json()).error.code).toBe("INVALID_INPUT");
  });
});

describe("GET /api/health", () => {
  it("reports status, is never cached, and exposes the injected build version", async () => {
    vi.stubEnv("APP_VERSION", "9.9.9");
    const response = await getHealth();
    const body = await response.json();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({ status: "ok", app: "embe", version: "9.9.9" });
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
