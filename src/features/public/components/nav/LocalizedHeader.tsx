"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { pickLocale } from "@/i18n/negotiate";
import type { HeaderLabels } from "./HeaderMenu";
import { PublicHeader } from "./PublicHeader";

const noSubscribe = () => () => undefined;
function readLocale(): Locale {
  const cookie = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([a-z]+)`))?.[1];
  return pickLocale(cookie, navigator.languages.join(","));
}

// The public header where no locale is known on the server (the 404 sits
// above every route): both languages' labels ship, the browser picks one the
// way NotFoundView does.
export function LocalizedHeader({ labels }: { labels: Record<Locale, HeaderLabels> }) {
  const locale = useSyncExternalStore(noSubscribe, readLocale, () => DEFAULT_LOCALE);
  return <PublicHeader labels={labels[locale]} />;
}
