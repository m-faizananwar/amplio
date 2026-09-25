import type { ReactNode } from "react";
import { enterLocale, localeParams, type LocaleParams } from "@/i18n/segment";

// en and fr are built ahead of time; anything else under this segment is a 404.
export const generateStaticParams = localeParams;
export const dynamicParams = false;

export default async function LocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  await enterLocale({ params });
  return children;
}
