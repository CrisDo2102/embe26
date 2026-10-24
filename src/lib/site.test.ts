import { afterEach, describe, expect, it, vi } from "vitest";

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return (await import("./site")).siteConfig;
}
afterEach(() => vi.unstubAllEnvs());

describe("siteConfig", () => {
  it("is private by default: search engines are not invited", async () => {
    const config = await load({ NEXT_PUBLIC_ALLOW_INDEXING: "" });
    expect(config.allowIndexing).toBe(false);
  });
  it("allows indexing only on an explicit, exact opt-in", async () => {
    expect((await load({ NEXT_PUBLIC_ALLOW_INDEXING: "true" })).allowIndexing).toBe(true);
    for (const value of ["TRUE", "1", "yes", "false"]) expect((await load({ NEXT_PUBLIC_ALLOW_INDEXING: value })).allowIndexing).toBe(false);
  });
  it("parses the public origin and ignores a malformed one instead of crashing the build", async () => {
    expect((await load({ NEXT_PUBLIC_SITE_URL: "https://our-site.vercel.app" })).metadataBase?.origin).toBe("https://our-site.vercel.app");
    expect((await load({ NEXT_PUBLIC_SITE_URL: "not a url" })).metadataBase).toBeUndefined();
    expect((await load({ NEXT_PUBLIC_SITE_URL: "" })).metadataBase).toBeUndefined();
  });
});
