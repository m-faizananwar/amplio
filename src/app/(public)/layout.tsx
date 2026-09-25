import type { ReactNode } from "react";
import { PublicAssistantPill } from "@/features/public/components/nav/PublicAssistantPill";
import { PublicFooter } from "@/features/public/components/nav/PublicFooter";
import { ClientMessages } from "@/i18n/ClientMessages";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ClientMessages namespaces={["landing", "public"]}>
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <PublicAssistantPill />
    </ClientMessages>
  );
}
