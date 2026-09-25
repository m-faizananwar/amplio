import type { ReactNode } from "react";
import { ClientMessages } from "@/i18n/ClientMessages";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <ClientMessages namespaces={["auth"]}>{children}</ClientMessages>;
}
