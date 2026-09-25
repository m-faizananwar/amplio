import type { ReactNode } from "react";
import { PublicAssistantPill } from "@/features/public/components/nav/PublicAssistantPill";
import { PublicFooter } from "@/features/public/components/nav/PublicFooter";
import { PublicNav } from "@/features/public/components/nav/PublicNav";
import { ClientMessages } from "@/i18n/ClientMessages";
import { enterLocale, type LocaleParams } from "@/i18n/segment";

// The public site's frame: nav, page, footer, the assistant pill. A layout,
// so a client navigation between public pages keeps the same header.
export default async function PublicLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  await enterLocale({ params });
  return (
    <ClientMessages namespaces={["landing", "public"]}>
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <PublicAssistantPill />
    </ClientMessages>
  );
}
