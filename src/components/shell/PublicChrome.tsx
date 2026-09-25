"use client";

import { usePathname } from "next/navigation";
import { GlassNav } from "@/features/public/components/nav/GlassNav";

// Routes with their own chrome (app shells, auth, onboarding, public creator cards, standalones).
const OWN_CHROME = ["/brand", "/creator", "/onboarding", "/login", "/register", "/forgot-password", "/reset-password", "/c/", "/demo", "/studio-footer", "/api", "/dev"];

// One glass nav instance for every public route, mounted from the root
// layout so a client navigation between the landing and /for-creators,
// /pricing, /about… keeps the same <header> — no remount, no flash.
export function PublicChrome() {
  const pathname = usePathname();
  if (OWN_CHROME.some((p) => pathname === p.replace(/\/$/, "") || pathname.startsWith(p))) return null;
  return <GlassNav />;
}
