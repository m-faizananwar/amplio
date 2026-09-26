import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ClientMessages } from "@/i18n/ClientMessages";
import { CreatorSetupView } from "@/features/creator-onboarding/components/setup/CreatorSetupView";
import { requireOnboardingCreator } from "@/features/creator-onboarding/server/viewer";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${(await getTranslations("onboarding.setup"))("creatorTitle")} · Amplio` };
}

// Setup inside the creator shell; ?step= opens a step (default: the first unfinished).
export default async function CreatorSetupPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const state = await requireOnboardingCreator("/creator/setup");
  const { step } = await searchParams;
  return (
    <ClientMessages namespaces={["onboarding", "settings"]}>
      <CreatorSetupView state={state} step={step} />
    </ClientMessages>
  );
}
