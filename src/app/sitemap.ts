import type { MetadataRoute } from "next";

// The public routes that exist. /benchmarks, /case-study, /about,
// /for-agencies and /book-a-call were removed with the claims they carried.
const ROUTES = ["", "/for-creators", "/pricing", "/faq", "/login", "/register", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://amplio-mvp.vercel.app";
  return ROUTES.map((route) => ({ url: `${base}${route}`, lastModified: new Date() }));
}
