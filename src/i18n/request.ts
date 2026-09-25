import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "./config";
import { loadMessages } from "./messages";

// The public pages set their locale from the [locale] segment (static); the
// app reads the cookie the language switch writes (dynamic). English otherwise.
export default getRequestConfig(async ({ requestLocale }) => {
  const fromSegment = await requestLocale;
  const locale = isLocale(fromSegment) ? fromSegment : await fromCookie();
  return { locale, messages: await loadMessages(locale), timeZone: "UTC" };
});

async function fromCookie() {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}
