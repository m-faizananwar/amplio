"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { WizardActions } from "@/components/flow/WizardActions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { PriceFields } from "@/features/profile-fields/components/PriceFields";
import { ONBOARDING_STEPS } from "../../constants";
import { type PriceInput, priceSchema } from "../../schemas";
import { savePricing } from "../../server/actions";
import { CreatorPreview } from "./CreatorPreview";
import type { CreatorCardData } from "./step-defaults";

type Props = { priceCents: number; bundles: PriceInput["bundles"]; recommendedCents: number; card: CreatorCardData; back: string };

// The price per post (starting from the suggestion) and up to three bundles;
// the card turns over to the facts, the price among them, live.
export function PriceForm({ priceCents, bundles, recommendedCents, card, back }: Props) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PriceInput>({ resolver: zodResolver(priceSchema), defaultValues: { priceCents, bundles } });
  const busy = form.formState.isSubmitting;
  const [livePrice, liveBundles] = useWatch({ control: form.control, name: ["priceCents", "bundles"] });

  async function onSubmit(values: PriceInput) {
    setError(null);
    const result = await savePricing(values);
    if (!result.ok) return setError(result.error);
    router.push(ONBOARDING_STEPS.professional.path);
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid content-start gap-6" data-area="fields" noValidate>
        <PriceFields control={form.control} recommendedCents={recommendedCents} />
        <FormAlert message={error} />
        <WizardActions back={back} backLabel={t("common.back")}>
          <Button type="submit" size="lg" className="h-11" disabled={busy}>{busy ? t("creator.price.creating") : t("common.continue")}</Button>
        </WizardActions>
      </form>
      <div data-area="card">
        <CreatorPreview data={{ ...card, priceCents: Number(livePrice) || 0, bundles: (liveBundles ?? []).length }} showBack />
      </div>
    </>
  );
}
