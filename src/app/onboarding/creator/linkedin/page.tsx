import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreatorStep } from "@/features/creator-onboarding/components/flow/CreatorStep";
import { LinkedinForm } from "@/features/creator-onboarding/components/flow/LinkedinForm";
import { cardData } from "@/features/creator-onboarding/components/flow/step-defaults";
import { ONBOARDING_STEPS } from "@/features/creator-onboarding/constants";
import { requireOnboardingCreator } from "@/features/creator-onboarding/server/viewer";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("onboarding.creator.linkedin"))("meta") };
}

export default async function LinkedinStepPage() {
  const state = await requireOnboardingCreator(ONBOARDING_STEPS.linkedin.path);
  return (
    <CreatorStep step="linkedin">
      <LinkedinForm linkedinUrl={state.linkedinUrl} alreadyRead={state.profileRead} card={cardData(state)} />
    </CreatorStep>
  );
}
