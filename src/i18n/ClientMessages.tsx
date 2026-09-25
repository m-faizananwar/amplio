import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";

type Props = { namespaces: string[]; children: ReactNode };

// Server components read every namespace through getTranslations(); client
// components only get what their surface sends here, so the landing doesn't
// carry the brand app's copy in its HTML. `common` always rides along.
// Wrap a layout: <ClientMessages namespaces={["landing"]}>…</ClientMessages>
export async function ClientMessages({ namespaces, children }: Props) {
  const all = await getMessages();
  const picked = Object.fromEntries(["common", ...namespaces].filter((n) => n in all).map((n) => [n, all[n]]));
  return <NextIntlClientProvider messages={picked}>{children}</NextIntlClientProvider>;
}
