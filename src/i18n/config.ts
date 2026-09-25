// Two locales, no locale in the URL: the choice lives in a cookie so links,
// the tracked-link redirects and the demo walkthrough stay one set of paths.
export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "fr";
}
