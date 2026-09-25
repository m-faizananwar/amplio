import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "./config";
import { loadMessages } from "./messages";

// next-intl without locale routing: the cookie set by the language switch
// decides, English otherwise.
export default getRequestConfig(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE;
  return { locale, messages: await loadMessages(locale), timeZone: "UTC" };
});
