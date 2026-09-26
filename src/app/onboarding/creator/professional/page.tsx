import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreatorStep } from "@/features/creator-onboarding/components/flow/CreatorStep";
import { LegalForm } from "@/features/creator-onboarding/components/flow/LegalForm";
import { cardData, legalDefaults } from "@/features/creator-onboarding/components/flow/step-defaults";
import { ONBOARDING_STEPS } from "@/features/creator-onboarding/constants";
import { requireOnboardingCreator } from "@/features/creator-onboarding/server/viewer";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("onboarding.creator.legal"))("meta") };
}

export default async function ProfessionalStepPage() {
  const state = await requireOnboardingCreator(ONBOARDING_STEPS.professional.path);
  // by this step the price is saved, the €20 floor included, so the card shows it
  return (
    <CreatorStep step="legal">
      <LegalForm defaults={legalDefaults(state)} card={{ ...cardData(state), priceCents: state.priceCents }} back={ONBOARDING_STEPS.price.path} />
    </CreatorStep>
  );
}
