import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

/**
 * Content-Security-Policy. Next.js needs inline bootstrap scripts, so `script-src` allows 'unsafe-inline'
 * (a nonce-based policy would force every page to be rendered per request). Everything else is locked to this origin:
 * no third-party scripts, frames, plugins, form targets or base-URI tricks.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Self-contained server bundle (.next/standalone). Only the Dockerfile needs it (it sets BUILD_STANDALONE=true);
  // `npm start` / Vercel use the regular output, so `next start` does not warn.
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" as const } : {}),
  env: { APP_VERSION: version },
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos are replaced by file name, so cache optimized variants for a day rather than "forever".
    minimumCacheTTL: 86_400,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Files in /public are not fingerprinted (README tells you to replace them in place),
        // so allow a day of caching and a week of stale-while-revalidate instead of `immutable`.
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
