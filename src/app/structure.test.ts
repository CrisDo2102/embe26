import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

/**
 * A root-level loading.tsx wraps the whole statically prerendered page in a Suspense boundary: the served HTML then
 * contains the loading screen with the real content hidden until an inline script swaps it in (flash on every visit,
 * delayed LCP, nothing readable without JavaScript). It came back once after a folder was copied over an old one,
 * so this guards it. See ADR 007. Add loading.tsx only to a segment that does real async work.
 */
it("has no root loading.tsx", () => {
  expect(existsSync(join(process.cwd(), "src/app/loading.tsx"))).toBe(false);
});
