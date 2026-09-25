import "server-only";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, LOCALES, type Locale } from "./config";

// The public and auth pages live under app/[locale] so each language is
// prerendered once; the proxy rewrites /pricing to /en/pricing or
// /fr/pricing from the cookie, and the URL the reader sees never changes.
export type LocaleParams = { params: Promise<{ locale: string }> };

export const localeParams = () => LOCALES.map((locale) => ({ locale }));

// Every layout, page and generateMetadata under [locale] calls this first:
// they render in parallel, and next-intl needs the locale set in each before
// a translation is read, or the page falls back to the cookie and goes dynamic.
export async function enterLocale({ params }: LocaleParams): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
