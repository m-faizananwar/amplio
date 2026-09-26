import { NotFoundView, type NotFoundCopy } from "@/components/page/NotFoundView";
import type { HeaderLabels } from "@/features/public/components/nav/HeaderMenu";
import { LocalizedHeader } from "@/features/public/components/nav/LocalizedHeader";
import { LOCALES, type Locale } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";
import "./not-found.css";

async function notFoundCopy(locale: Locale): Promise<{ page: NotFoundCopy; nav: HeaderLabels }> {
  const messages = await loadMessages(locale);
  // messages/<locale>/public.json → notFound, landing.json → nav; the shapes are checked by the views' types
  return {
    page: (messages.public as { notFound: NotFoundCopy }).notFound,
    nav: (messages.landing as { nav: HeaderLabels }).nav,
  };
}

// 404: the public header, then the mark's trail snaps and its dots fall
// (DIRECTION.md, "404"). The copy for both languages is read at build time,
// not from the request.
export default async function NotFound() {
  const entries = await Promise.all(LOCALES.map(async (locale) => [locale, await notFoundCopy(locale)] as const));
  const pick = <K extends "page" | "nav">(key: K) => Object.fromEntries(entries.map(([l, c]) => [l, c[key]])) as Record<Locale, (typeof entries)[number][1][K]>;
  return (
    <>
      <LocalizedHeader labels={pick("nav")} />
      <NotFoundView copy={pick("page")} />
    </>
  );
}
