function parseUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export const siteConfig = {
  title: "For My Love — Một chiếc hộp kỷ niệm",
  description: "Một góc nhỏ lưu giữ những điều anh muốn dành riêng cho em.",
  /**
   * This is a personal keepsake, so search engines are told to stay away by default.
   * Set NEXT_PUBLIC_ALLOW_INDEXING=true only if you deliberately want it to be findable.
   */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  /** Optional absolute origin (e.g. https://our-site.vercel.app); needed only for absolute social-card URLs. */
  metadataBase: parseUrl(process.env.NEXT_PUBLIC_SITE_URL),
} as const;
