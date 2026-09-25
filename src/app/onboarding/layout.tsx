import type { ReactNode } from "react";
import { ClientMessages } from "@/i18n/ClientMessages";

// the shared profile fields read `settings`; the screens read `onboarding`
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <ClientMessages namespaces={["settings", "onboarding", "auth"]}>{children}</ClientMessages>;
}
