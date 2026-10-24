#!/usr/bin/env node
/**
 * Production smoke test. Boots `next start` (or targets SMOKE_URL) and checks what unit tests cannot:
 * real HTTP behaviour, security headers, caching, image optimization and the server-rendered HTML.
 * Usage: npm run build && npm run smoke
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const results = [];
let failures = 0;

async function check(name, fn) {
  try {
    await fn();
    results.push(`  ✓ ${name}`);
  } catch (error) {
    failures += 1;
    results.push(`  ✗ ${name}\n      ${error instanceof Error ? error.message : error}`);
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });

async function boot() {
  if (process.env.SMOKE_URL) return { base: process.env.SMOKE_URL.replace(/\/$/, ""), stop: () => {} };
  const port = await freePort();
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));
  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Server exited early:\n${output}`);
    try {
      if ((await fetch(`${base}/api/health`)).ok) return { base, stop: () => child.kill() };
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  child.kill();
  throw new Error(`Server did not become healthy in 30s:\n${output}`);
}

const { base, stop } = await boot();
const get = (path, init) => fetch(base + path, { redirect: "manual", ...init });

try {
  let html = "";

  await check("GET / renders the page on the server (200, HTML, lang=vi)", async () => {
    const response = await get("/");
    html = await response.text();
    assert(response.status === 200, `status ${response.status}`);
    assert(response.headers.get("content-type")?.includes("text/html"), "not html");
    assert(html.includes('lang="vi"'), "missing lang=vi");
  });
  await check("first HTML already contains the hero copy, timeline and memory list (no JS needed)", () => {
    for (const text of ["To my favorite", "person.", "Ngày mọi thứ bắt đầu", "Buổi hẹn đầu tiên", "Chiếc hộp vẫn đang chờ", 'id="main"']) {
      assert(html.includes(text), `missing in SSR HTML: ${text}`);
    }
  });
  await check("the page is plain static HTML: one <h1>, no streamed 'loading' shell, nothing hidden awaiting a script", () => {
    const h1s = html.match(/<h1[^>]*>/g) ?? [];
    assert(h1s.length === 1, `expected exactly one <h1>, found ${h1s.length}: ${h1s.join(" ")}`);
    assert(!/style=/.test(h1s[0]), `h1 starts hidden/transformed: ${h1s[0]}`);
    assert(!html.includes("Đang mở chiếc hộp nhỏ"), "a loading screen is baked into the HTML");
    assert(!/<div hidden id="S:\d+"/.test(html) && !html.includes("$RC("), "content is streamed into a hidden segment and needs JS to appear");
  });
  await check("declares UTF-8 exactly once (Next adds it itself; HTML allows only one charset meta)", () => {
    const count = (html.match(/<meta charSet="utf-8"/gi) ?? []).length;
    assert(count === 1, `found ${count} charset meta tags`);
  });
  await check("the hero image is preloaded for fast LCP", () => {
    assert(/<link[^>]+rel="preload"[^>]+as="image"/.test(html) || /<link[^>]+as="image"[^>]+rel="preload"/.test(html), "no image preload link");
  });
  await check("private by default: noindex meta + robots.txt disallow", async () => {
    assert(/<meta name="robots" content="noindex/.test(html), "missing noindex meta");
    const robots = await (await get("/robots.txt")).text();
    assert(/Disallow:\s*\//.test(robots), `robots.txt: ${robots}`);
  });
  await check("sets strict security headers and hides x-powered-by", async () => {
    const h = (await get("/")).headers;
    const csp = h.get("content-security-policy") ?? "";
    for (const part of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'"]) assert(csp.includes(part), `CSP lacks ${part}`);
    assert(h.get("x-content-type-options") === "nosniff", "nosniff");
    assert(h.get("x-frame-options") === "DENY", "x-frame-options");
    assert(h.get("referrer-policy") === "strict-origin-when-cross-origin", "referrer-policy");
    assert((h.get("permissions-policy") ?? "").includes("camera=()"), "permissions-policy");
    assert(!h.has("x-powered-by"), "x-powered-by leaked");
  });

  await check("GET /api/health reports ok, is uncached, and carries the build version", async () => {
    const response = await get("/api/health");
    const body = await response.json();
    assert(body.status === "ok", JSON.stringify(body));
    assert(body.version === pkg.version, `version ${body.version} != ${pkg.version}`);
    assert(response.headers.get("cache-control") === "no-store", "cache-control");
  });
  await check("GET /api/memories returns the stable envelope", async () => {
    const body = await (await get("/api/memories")).json();
    assert(Array.isArray(body.data) && body.data.length === body.meta.count && body.meta.count > 0, JSON.stringify(body.meta));
  });
  await check("search works without diacritics and with decomposed (NFD) input", async () => {
    for (const q of ["hen ho", "hẹn hò".normalize("NFD")]) {
      const body = await (await get(`/api/memories?q=${encodeURIComponent(q)}`)).json();
      assert(body.data.some((m) => m.id === "memory-2"), `q=${JSON.stringify(q)} → ${JSON.stringify(body.data.map((m) => m.id))}`);
    }
  });
  await check("conditional requests: ETag then 304", async () => {
    const first = await get("/api/memories?q=hen");
    const etag = first.headers.get("etag");
    assert(etag, "no etag");
    const second = await get("/api/memories?q=hen", { headers: { "If-None-Match": etag } });
    assert(second.status === 304, `status ${second.status}`);
  });
  await check("GET /api/memories/:id → 200, 404 and 400 with a stable error shape", async () => {
    assert((await get("/api/memories/memory-2")).status === 200, "memory-2");
    const missing = await get("/api/memories/nope");
    assert(missing.status === 404 && (await missing.json()).error.code === "NOT_FOUND", "404 shape");
    const unsafe = await get("/api/memories/a%20b");
    assert(unsafe.status === 400 && (await unsafe.json()).error.code === "INVALID_INPUT", "400 shape");
  });

  await check("unknown routes show the friendly 404 page with status 404", async () => {
    const response = await get("/no-such-page");
    assert(response.status === 404, `status ${response.status}`);
    assert((await response.text()).includes("Trang này đi lạc mất rồi."), "missing friendly text");
  });
  await check("icons are served (svg + apple touch icon)", async () => {
    const svg = await get("/icon.svg");
    assert(svg.status === 200 && svg.headers.get("content-type")?.includes("svg"), "icon.svg");
    assert((await get("/apple-icon.png")).status === 200, "apple-icon.png");
  });
  await check("images are optimized (modern format, smaller than the original)", async () => {
    const match = html.match(/src="(\/_next\/image\?[^"]+)"/);
    assert(match, "no optimized image URL in HTML");
    const url = match[1].replaceAll("&amp;", "&");
    const optimized = await get(url, { headers: { Accept: "image/avif,image/webp,image/*" } });
    assert(optimized.status === 200, `status ${optimized.status}`);
    const type = optimized.headers.get("content-type") ?? "";
    assert(/image\/(avif|webp)/.test(type), `content-type ${type}`);
    const size = (await optimized.arrayBuffer()).byteLength;
    const original = (await (await get("/assets/images/cover.jpg")).arrayBuffer()).byteLength;
    assert(size < original / 2, `optimized ${size}B is not < half of original ${original}B`);
  });
  await check("static assets are cacheable but not immutable (files are replaced in place)", async () => {
    const cache = (await get("/assets/images/cover.jpg")).headers.get("cache-control") ?? "";
    assert(cache.includes("max-age=86400") && !cache.includes("immutable"), `cache-control: ${cache}`);
  });
  await check("the soundtrack supports Range requests (seeking, no full download)", async () => {
    const response = await get("/assets/music/birthday-song.mp3", { headers: { Range: "bytes=0-99" } });
    assert(response.status === 206, `status ${response.status}`);
    assert((await response.arrayBuffer()).byteLength === 100, "wrong slice length");
  });
} finally {
  stop();
}

console.log(`\nSmoke test against ${base}\n${results.join("\n")}\n\n${failures === 0 ? "All checks passed." : `${failures} check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
