import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./config";

// The reader's choice (the cookie the language switch writes) wins; a first
// visit follows the browser's Accept-Language, best-weighted match first.
export function pickLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookie)) return cookie;
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { base: tag.toLowerCase().split("-")[0] ?? "", q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  const match = ranked.find((entry) => (LOCALES as ReadonlyArray<string>).includes(entry.base));
  return match && isLocale(match.base) ? match.base : DEFAULT_LOCALE;
}
