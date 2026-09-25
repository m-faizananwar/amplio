import type { ReactNode } from "react";
import { ClientMessages } from "@/i18n/ClientMessages";

// A creator's public card has no client copy of its own; this sets its lang.
export default function PublicCardLayout({ children }: { children: ReactNode }) {
  return <ClientMessages namespaces={[]}>{children}</ClientMessages>;
}
