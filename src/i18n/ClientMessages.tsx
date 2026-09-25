import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { isLocale } from "./config";
import { HtmlLang } from "./HtmlLang";

type Props = { namespaces: string[]; children: ReactNode };

// Server components read every namespace through getTranslations(); client
// components only get what their surface sends here, so the landing doesn't
// carry the brand app's copy in its HTML. `common` always rides along.
// Every area mounts one of these, so it is also where <html lang> is set.
// Wrap a layout: <ClientMessages namespaces={["landing"]}>…</ClientMessages>
export async function ClientMessages({ namespaces, children }: Props) {
  const [all, locale] = await Promise.all([getMessages(), getLocale()]);
  const picked = Object.fromEntries(["common", ...namespaces].filter((n) => n in all).map((n) => [n, all[n]]));
  return (
    <NextIntlClientProvider messages={picked}>
      {isLocale(locale) ? <HtmlLang locale={locale} /> : null}
      {children}
    </NextIntlClientProvider>
  );
}
