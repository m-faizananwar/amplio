import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CardForm } from "@/features/creator-onboarding/components/flow/CardForm";
import { CreatorStep } from "@/features/creator-onboarding/components/flow/CreatorStep";
import { ONBOARDING_STEPS } from "@/features/creator-onboarding/constants";
import { requireOnboardingCreator } from "@/features/creator-onboarding/server/viewer";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("onboarding.creator.card"))("meta") };
}

export default async function CardStepPage() {
  const state = await requireOnboardingCreator(ONBOARDING_STEPS.card.path);
  return (
    <CreatorStep step="card">
      <CardForm state={state} back={ONBOARDING_STEPS.linkedin.path} />
    </CreatorStep>
  );
}
