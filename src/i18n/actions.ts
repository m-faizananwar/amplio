"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./config";

const YEAR_S = 60 * 60 * 24 * 365;

// The language switch. Returns false for anything that isn't a locale we ship.
export async function setLocale(locale: string): Promise<boolean> {
  if (!isLocale(locale)) return false;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR_S, sameSite: "lax" });
  return true;
}
