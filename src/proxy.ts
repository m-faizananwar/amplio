import { type NextRequest, NextResponse } from "next/server";
import { REGISTER_ROLE_PARAM, SESSION_COOKIE } from "@/features/auth/constants";
import { LOCALE_COOKIE } from "@/i18n/config";
import { pickLocale } from "@/i18n/negotiate";
import { resolveDatabaseUrl } from "@/lib/database-url";

// First path segments served from app/[locale]: prerendered once per language.
const LOCALIZED = new Set(["", "pricing", "for-creators", "faq", "privacy", "terms", "login", "register", "forgot-password", "reset-password"]);

// Optimistic guard: a session cookie must exist to enter either app shell.
// The layouts do the real check (valid session, correct role). Without a
// database there is nothing to protect, so the shells stay reachable and
// render their "database not configured" state.
function guardApp(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession || resolveDatabaseUrl(process.env) === null) return NextResponse.next();
  const url = new URL("/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

// The public pages: same URL for everyone, the language picked here and
// served from that language's static copy (/pricing → /fr/pricing inside).
function localize(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  // Older /register?role=… links: the page is static and can't read the query.
  const role = pathname === "/register" ? searchParams.get("role") : null;
  const roleTarget = role ? REGISTER_ROLE_PARAM[role] : undefined;
  if (roleTarget) return NextResponse.redirect(new URL(roleTarget, request.url));
  const locale = pickLocale(request.cookies.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export function proxy(request: NextRequest) {
  const first = request.nextUrl.pathname.split("/")[1] ?? "";
  if (first === "brand" || first === "creator") return guardApp(request);
  if (LOCALIZED.has(first)) return localize(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", "/brand/:path*", "/creator/:path*",
    "/pricing", "/for-creators", "/faq", "/privacy", "/terms",
    "/login", "/register/:path*", "/forgot-password", "/reset-password/:path*",
  ],
};
