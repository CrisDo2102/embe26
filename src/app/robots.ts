import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: siteConfig.allowIndexing ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" } };
}
