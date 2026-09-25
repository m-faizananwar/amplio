import type { ReactNode } from "react";
import { ClientMessages } from "@/i18n/ClientMessages";
import { enterLocale, type LocaleParams } from "@/i18n/segment";

export default async function AuthLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  await enterLocale({ params });
  return <ClientMessages namespaces={["auth"]}>{children}</ClientMessages>;
}
