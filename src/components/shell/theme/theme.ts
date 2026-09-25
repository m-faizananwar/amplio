// The system decides unless the reader picked light or dark; the pick is a
// cookie. Nothing on the server reads it: the boot script below sets the class
// before first paint, so every page can stay static and still never flashes.
export const THEME_COOKIE = "amplio-theme";
export const THEME_CHOICES = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];
export type Theme = "light" | "dark";
export const isThemeChoice = (v: string | undefined | null): v is ThemeChoice =>
  (THEME_CHOICES as ReadonlyArray<string>).includes(v ?? "");

// Inlined in <head> by the root layout, so it runs before the body paints.
// It also follows the OS when that changes mid-visit, as long as the choice
// is still "system" (the cookie is re-read on every change).
export const THEME_BOOT_SCRIPT = `(function(){try{var q=matchMedia("(prefers-color-scheme: dark)");function c(){var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);return m?m[1]:"system"}function a(){var v=c(),d=v==="dark"||(v==="system"&&q.matches),r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}a();q.addEventListener("change",a)}catch(e){}})()`;
