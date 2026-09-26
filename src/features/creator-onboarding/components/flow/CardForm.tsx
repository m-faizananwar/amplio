"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { WizardActions } from "@/components/flow/WizardActions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { CardFields } from "@/features/profile-fields/components/CardFields";
import { COUNTRIES, ONBOARDING_STEPS } from "../../constants";
import { type CardInput, cardSchema } from "../../schemas";
import { saveCreatorCard } from "../../server/actions";
import type { OnboardingState } from "../../server/queries";
import { CreatorPreview } from "./CreatorPreview";
import { cardData, cardDefaults } from "./step-defaults";
import { useFlyToCard } from "./useFlyToCard";

// Headline, country, up to three industries — and the card brands will see,
// building itself beside them as the fields fill in (each value flies in).
export function CardForm({ state, back }: { state: OnboardingState; back: string }) {
  const t = useTranslations("onboarding.creator.card");
  const tc = useTranslations("onboarding.common");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CardInput>({ resolver: zodResolver(cardSchema), defaultValues: cardDefaults(state) });
  const [headline, country, industries] = useWatch({ control: form.control, name: ["headline", "country", "industries"] });
  const busy = form.formState.isSubmitting;
  const headlineSlot = useRef<HTMLParagraphElement>(null);
  const countrySlot = useRef<HTMLSpanElement>(null);
  const industrySlot = useRef<HTMLDivElement>(null);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? "";
  const live = { ...cardData(state), headline: headline ?? "", country: country ?? "", industries: industries ?? [] };
  useFlyToCard(headline ?? "", "headline", headlineSlot);
  useFlyToCard(countryName, "country", countrySlot);
  useFlyToCard((industries ?? []).at(-1) ?? "", "industries-count", industrySlot);

  async function onSubmit(values: CardInput) {
    setError(null);
    const result = await saveCreatorCard(values);
    if (!result.ok) return setError(result.error);
    router.push(ONBOARDING_STEPS.price.path);
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid content-start gap-6" data-area="fields" noValidate>
        <CardFields control={form.control} />
        <p className="text-caption text-ink-muted">{state.profileRead && state.followers > 0 ? t("fromLinkedin") : t("enteredByHand")}</p>
        <FormAlert message={error} />
        <WizardActions back={back} backLabel={tc("back")}>
          <Button type="submit" size="lg" className="h-11" disabled={busy}>{busy ? tc("saving") : tc("continue")}</Button>
        </WizardActions>
      </form>
      <div data-area="card">
        <CreatorPreview data={live} slots={{ headline: headlineSlot, country: countrySlot, industries: industrySlot }} />
      </div>
    </>
  );
}
