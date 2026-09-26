import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreatorStep } from "@/features/creator-onboarding/components/flow/CreatorStep";
import { PriceForm } from "@/features/creator-onboarding/components/flow/PriceForm";
import { cardData, startingPrice } from "@/features/creator-onboarding/components/flow/step-defaults";
import { ONBOARDING_STEPS } from "@/features/creator-onboarding/constants";
import { requireOnboardingCreator } from "@/features/creator-onboarding/server/viewer";
import { recommendPrice } from "@/lib/recommend-price";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("onboarding.creator.price"))("meta") };
}

export default async function PriceStepPage() {
  const state = await requireOnboardingCreator(ONBOARDING_STEPS.price.path);
  const recommended = recommendPrice(state.followers, state.industries, state.engagementRate);
  return (
    <CreatorStep step="price">
      <PriceForm priceCents={startingPrice(state, recommended)} bundles={state.bundles} recommendedCents={recommended} card={cardData(state)} back={ONBOARDING_STEPS.card.path} />
    </CreatorStep>
  );
}
