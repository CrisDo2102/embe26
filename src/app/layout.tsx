import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/MotionProvider";
import { APP_NAME } from "@/lib/constants";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteConfig.metadataBase,
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: APP_NAME,
  robots: siteConfig.allowIndexing ? undefined : { index: false, follow: false, nocache: true },
  // Deliberately no preview image: a shared link should not expose a private photo by itself.
  openGraph: { title: siteConfig.title, description: siteConfig.description, type: "website", locale: "vi_VN" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f1e8", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        {/* Scroll-reveal starts hidden and needs JavaScript; without it, keep everything visible. */}
        <noscript><style>{".reveal{opacity:1!important;transform:none!important}"}</style></noscript>
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
