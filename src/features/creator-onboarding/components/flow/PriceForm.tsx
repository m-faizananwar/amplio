"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { PriceFields } from "@/features/profile-fields/components/PriceFields";
import { ONBOARDING_STEPS } from "../../constants";
import { type PriceInput, priceSchema } from "../../schemas";
import { savePricing } from "../../server/actions";

// The price per post (starting from the suggestion) and up to three bundles.
export function PriceForm({ priceCents, bundles, recommendedCents }: { priceCents: number; bundles: PriceInput["bundles"]; recommendedCents: number }) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PriceInput>({ resolver: zodResolver(priceSchema), defaultValues: { priceCents, bundles } });
  const busy = form.formState.isSubmitting;

  async function onSubmit(values: PriceInput) {
    setError(null);
    const result = await savePricing(values);
    if (!result.ok) return setError(result.error);
    router.push(ONBOARDING_STEPS.professional.path);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <PriceFields control={form.control} recommendedCents={recommendedCents} />
      <FormAlert message={error} />
      <Button type="submit" size="lg" className="h-11" disabled={busy}>{busy ? t("creator.price.creating") : t("common.continue")}</Button>
    </form>
  );
}
