import type { ReactNode } from "react";
import { LaunchMotion } from "@/features/public/components/launch/LaunchMotion";
import { PublicAssistantPill } from "@/features/public/components/nav/PublicAssistantPill";
import { PublicFooter } from "@/features/public/components/nav/PublicFooter";
import { PublicNav } from "@/features/public/components/nav/PublicNav";
import { ClientMessages } from "@/i18n/ClientMessages";
import { enterLocale, type LocaleParams } from "@/i18n/segment";
import "@/features/public/components/motion/public-motion.css";

// The public site's frame: nav, page, footer, the assistant pill. A layout,
// so a client navigation between public pages keeps the same header.
export default async function PublicLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  await enterLocale({ params });
  return (
    <ClientMessages namespaces={["landing", "public"]}>
      <LaunchMotion />
      <PublicNav />
      <main className="public-ix flex-1">{children}</main>
      <PublicFooter />
      <PublicAssistantPill />
    </ClientMessages>
  );
}
