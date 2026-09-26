// Light unless the reader picked otherwise; the pick is a cookie ("light",
// "dark", or "system" to follow the OS). Nothing on the server reads it: the
// boot script below sets the class before first paint, so every page can stay
// static and still never flashes.
export const THEME_COOKIE = "amplio-theme";
export const THEME_CHOICES = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];
export type Theme = "light" | "dark";
export const DEFAULT_THEME_CHOICE: ThemeChoice = "light";
export const isThemeChoice = (v: string | undefined | null): v is ThemeChoice =>
  (THEME_CHOICES as ReadonlyArray<string>).includes(v ?? "");

// The reader's pick from a cookie string; no cookie (or a stale value) is light.
export function choiceFromCookie(cookie: string): ThemeChoice {
  const match = cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([a-z]+)`));
  return match && isThemeChoice(match[1]) ? match[1] : DEFAULT_THEME_CHOICE;
}

// What shows for a pick: only an explicit "system" asks the OS.
export function resolveTheme(choice: ThemeChoice, osPrefersDark: boolean): Theme {
  return choice === "dark" || (choice === "system" && osPrefersDark) ? "dark" : "light";
}

// Inlined in <head> by the root layout, so it runs before the body paints.
// Same rules as above; it follows OS changes mid-visit only while the pick is
// "system" (the cookie is re-read on every change).
export const THEME_BOOT_SCRIPT = `(function(){try{var q=matchMedia("(prefers-color-scheme: dark)");function c(){var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark|system)/);return m?m[1]:"${DEFAULT_THEME_CHOICE}"}function a(){var v=c(),d=v==="dark"||(v==="system"&&q.matches),r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}a();if(c()==="system")q.addEventListener("change",a)}catch(e){}})()`;
