"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Routes with their own chrome (app shells, auth, onboarding, public creator cards, standalones).
const OWN_CHROME = ["/brand", "/creator", "/onboarding", "/login", "/register", "/forgot-password", "/reset-password", "/c/", "/demo", "/api", "/dev"];

// One public nav for every public route, mounted from the root layout so a
// client navigation between public pages keeps the same <header>. The nav
// itself is server-rendered (it reads its copy) and handed in as `nav`.
export function PublicChrome({ nav }: { nav: ReactNode }) {
  const pathname = usePathname();
  if (OWN_CHROME.some((p) => pathname === p.replace(/\/$/, "") || pathname.startsWith(p))) return null;
  return nav;
}
