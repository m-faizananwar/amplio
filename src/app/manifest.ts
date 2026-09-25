import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

// The installable icon set: the mark on a paper disc (scripts/icons.mjs).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.wordmark,
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF7",
    theme_color: "#111111",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
