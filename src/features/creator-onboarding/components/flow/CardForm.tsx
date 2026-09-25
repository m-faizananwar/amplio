"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { formatCount } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { CardFields } from "@/features/profile-fields/components/CardFields";
import { COUNTRIES, ONBOARDING_STEPS } from "../../constants";
import { type CardInput, cardSchema } from "../../schemas";
import { saveCreatorCard } from "../../server/actions";
import type { OnboardingState } from "../../server/queries";
import { cardDefaults } from "./step-defaults";
import { useFlyToCard } from "./useFlyToCard";

// Headline, country, up to three industries — and the card brands will see,
// building itself underneath as the fields fill in.
export function CardForm({ state }: { state: OnboardingState }) {
  const t = useTranslations("onboarding.creator.card");
  const tc = useTranslations("onboarding.common");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CardInput>({ resolver: zodResolver(cardSchema), defaultValues: cardDefaults(state) });
  const [headline, country, industries] = useWatch({ control: form.control, name: ["headline", "country", "industries"] });
  const busy = form.formState.isSubmitting;
  const headlineSlot = useRef<HTMLParagraphElement>(null);
  const countrySlot = useRef<HTMLSpanElement>(null);
  const industrySlot = useRef<HTMLDivElement>(null);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? "";
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <CardFields control={form.control} />
      <figure className="rounded-card border border-rule bg-surface p-5 shadow-float" aria-label={t("previewLabel")}>
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-ink font-semibold text-paper" aria-hidden="true">{state.name.slice(0, 1)}</span>
          <div className="min-w-0">
            <p className="font-semibold">{state.name}</p>
            <p ref={headlineSlot} className="truncate text-small text-ink-muted">{headline || "—"}</p>
          </div>
          <span ref={countrySlot} className="ml-auto text-caption text-ink-muted">{countryName}</span>
        </div>
        <div ref={industrySlot} className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-rule pt-3">
          {state.followers > 0 ? <span className="num text-small">{formatCount(state.followers, locale)}</span> : null}
          {(industries ?? []).map((i) => <span key={i} className="rounded-chip border border-rule px-2.5 py-0.5 text-caption">{i}</span>)}
        </div>
        <figcaption className="mt-3 text-caption text-ink-muted">{state.profileRead && state.followers > 0 ? t("fromLinkedin") : t("enteredByHand")}</figcaption>
      </figure>
      <FormAlert message={error} />
      <Button type="submit" size="lg" className="h-11" disabled={busy}>{busy ? tc("saving") : tc("continue")}</Button>
    </form>
  );
}
