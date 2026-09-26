import { NotFoundView, type NotFoundCopy } from "@/components/page/NotFoundView";
import { LOCALES, type Locale } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";
import "./not-found.css";

async function notFoundCopy(locale: Locale): Promise<NotFoundCopy> {
  const messages = await loadMessages(locale);
  // messages/<locale>/public.json → notFound; the shape is checked by the view's type
  return (messages.public as { notFound: NotFoundCopy }).notFound;
}

// 404: the mark's trail snaps and its dots fall (DIRECTION.md, "404"). The
// copy for both languages is read at build time, not from the request.
export default async function NotFound() {
  const entries = await Promise.all(LOCALES.map(async (locale) => [locale, await notFoundCopy(locale)] as const));
  return <NotFoundView copy={Object.fromEntries(entries) as Record<Locale, NotFoundCopy>} />;
}
