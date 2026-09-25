// Light is the default; dark is a choice remembered in a cookie so the server
// renders the right palette on the first byte (no flash).
export const THEME_COOKIE = "amplio-theme";
export type Theme = "light" | "dark";
export const isTheme = (v: string | undefined | null): v is Theme => v === "light" || v === "dark";
