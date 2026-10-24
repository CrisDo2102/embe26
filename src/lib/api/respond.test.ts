import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/domain/memories/errors";
import { errorResponse, jsonCached, jsonError, matchesEtag, weakEtag } from "./respond";

afterEach(() => vi.restoreAllMocks());

describe("weakEtag / matchesEtag", () => {
  it("is deterministic and content-sensitive", () => {
    expect(weakEtag("a")).toBe(weakEtag("a"));
    expect(weakEtag("a")).not.toBe(weakEtag("b"));
    expect(weakEtag("a")).toMatch(/^W\/"[\w-]{27}"$/);
  });
  it("implements If-None-Match semantics", () => {
    const tag = weakEtag("x");
    expect(matchesEtag(null, tag)).toBe(false);
    expect(matchesEtag(tag, tag)).toBe(true);
    expect(matchesEtag(tag.replace("W/", ""), tag)).toBe(true); // weak comparison ignores the W/ prefix
    expect(matchesEtag(`"other", ${tag}`, tag)).toBe(true);
    expect(matchesEtag("*", tag)).toBe(true);
    expect(matchesEtag('"other"', tag)).toBe(false);
  });
});

describe("jsonCached", () => {
  const request = (headers?: HeadersInit) => new Request("http://localhost/x", { headers });
  it("returns 200 with ETag and cache headers", async () => {
    const response = jsonCached(request(), { a: 1 }, "public, max-age=5");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toBe("public, max-age=5");
    expect(await response.json()).toEqual({ a: 1 });
  });
  it("returns an empty 304 when the client already holds this body", async () => {
    const etag = jsonCached(request(), { a: 1 }, "x").headers.get("etag") as string;
    const response = jsonCached(request({ "if-none-match": etag }), { a: 1 }, "x");
    expect(response.status).toBe(304);
    expect(await response.text()).toBe("");
    expect(jsonCached(request({ "if-none-match": etag }), { a: 2 }, "x").status).toBe(200);
  });
});

describe("errors", () => {
  it("jsonError has a stable shape and is never cached", async () => {
    const response = jsonError("X", "msg", 418);
    expect(response.status).toBe(418);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: { code: "X", message: "msg" } });
  });
  it.each([
    ["INVALID_INPUT", 400],
    ["NOT_FOUND", 404],
    ["STORAGE_UNAVAILABLE", 503],
  ] as const)("maps domain error %s to HTTP %i", async (code, status) => {
    const response = errorResponse(new DomainError(code, "safe message"), "t");
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: { code, message: "safe message" } });
  });
  it("answers unexpected errors generically and does not leak details", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = errorResponse(new Error("password=hunter2"), "t");
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("hunter2");
    expect(spy).toHaveBeenCalledOnce();
  });
});
