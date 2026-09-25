"use server";

import { cookies } from "next/headers";
import { isTheme, THEME_COOKIE } from "./theme";

const YEAR_S = 60 * 60 * 24 * 365;

// A display preference, not account data: a cookie is enough.
export async function setTheme(theme: string): Promise<boolean> {
  if (!isTheme(theme)) return false;
  (await cookies()).set(THEME_COOKIE, theme, { path: "/", maxAge: YEAR_S, sameSite: "lax" });
  return true;
}
