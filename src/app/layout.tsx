import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { THEME_BOOT_SCRIPT } from "@/components/shell/theme/theme";
import { ClientMessages } from "@/i18n/ClientMessages";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { PointerTilt } from "@/components/motion/PointerTilt";
import { RouteProgress } from "@/components/motion/RouteProgress";
import { PublicChrome } from "@/components/shell/PublicChrome";
import { PublicNav } from "@/features/public/components/nav/PublicNav";
import { ScrollMorph } from "@/components/motion/ScrollMorph";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "@/styles/interaction.css";

import { BRAND } from "@/config/brand";
// Cormorant stays only until the last old landing component that names it is removed.
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], variable: "--font-cormorant", display: "swap" });

// Geist for every word, Geist Mono for every number (docs/design/DIRECTION.md).
// next/font downloads them at build time and serves them from our origin.
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const TOAST_MS = 3000;

export const metadata: Metadata = {
  title: `${BRAND.wordmark}`,
  description: "Creator marketplace — rebuild",
  // The three-dot trail mark (scripts/icons.mjs renders the PNGs from public/favicon.svg and public/mark.svg).
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// The canvas behind the page follows the OS until the boot script has run.
export const viewport: Viewport = { colorScheme: "light dark" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    // The boot script adds `dark` before hydration, so the class the server
    // sent is expected to differ from the one React finds.
    <html lang={locale} suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}>
      <head>
        {/* Before first paint: light, dark, or whatever the OS says. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ClientMessages namespaces={[]}>
        <RouteProgress />
        <PublicChrome nav={<PublicNav />} />
        <ScrollMorph />
        <PointerTilt />
        {children}
        <Toaster position="bottom-right" duration={TOAST_MS} />
        <Analytics />
        <SpeedInsights />
        </ClientMessages>
      </body>
    </html>
  );
}
