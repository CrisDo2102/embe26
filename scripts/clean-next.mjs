import { rm } from "node:fs/promises";

// Next.js generates route declarations in .next. If a previous run was
// interrupted, a truncated generated .d.ts can break TypeScript before the
// app is compiled. Regenerate the cache on dev/build/typecheck entry points.
await rm(".next", { recursive: true, force: true });
console.log("Removed stale .next cache; Next.js will regenerate it.");
