import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { THEME_BOOT_SCRIPT } from "@/components/shell/theme/theme";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { RouteProgress } from "@/components/motion/RouteProgress";
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

// Reads nothing from the request, so the public pages under [locale] can be
// static. Each area brings its own messages (ClientMessages) and corrects
// `lang` (HtmlLang); the theme class comes from the boot script.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The boot script adds `dark` before hydration, so the class the server
    // sent is expected to differ from the one React finds.
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}>
      <head>
        {/* Before first paint: light, dark, or whatever the OS says. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <RouteProgress />
        <ScrollMorph />
        {children}
        <Toaster position="bottom-right" duration={TOAST_MS} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
