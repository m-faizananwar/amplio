"use client";

import { Plus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { type Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { defaultBundle } from "@/features/creator-onboarding/bundles";
import { CENTS_PER_EURO, MAX_BUNDLES } from "@/features/creator-onboarding/constants";
import type { PriceInput } from "@/features/creator-onboarding/schemas";
import { PRICE_CAP_CENTS, PRICE_FLOOR_CENTS } from "@/lib/recommend-price";
import { BundleFields } from "./BundleFields";
import { fieldError } from "./field-error";
import { describedBy, FormField } from "./FormField";
import { MoneyInput } from "./MoneyInput";

type Props = { control: Control<PriceInput>; /** Onboarding shows the suggested price; settings can too. */ recommendedCents?: number };

// priceSchema: net price per post (what the creator receives) and up to three bundles.
export function PriceFields({ control, recommendedCents }: Props) {
  const t = useTranslations("settings.creator.pricing");
  const format = useFormatter();
  const money = (c: number) => format.number(c / CENTS_PER_EURO, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const bundles = useFieldArray({ control, name: "bundles" });
  const live = useWatch({ control });
  const priceCents = live.priceCents ?? 0;
  const hint = `${t("price.help", { min: money(PRICE_FLOOR_CENTS), max: money(PRICE_CAP_CENTS) })}${recommendedCents ? ` ${t("price.recommendation", { amount: money(recommendedCents) })}` : ""}`;
  return (
    <div className="grid gap-5">
      <Controller control={control} name="priceCents" render={({ field, fieldState }) => {
        const error = fieldError(fieldState.error, { too_small: t("errors.priceMin", { amount: money(PRICE_FLOOR_CENTS) }), too_big: t("errors.priceMax", { amount: money(PRICE_CAP_CENTS) }) }, t("errors.priceRequired"));
        return (
          <FormField id="priceCents" label={t("price.label")} hint={hint} error={error}>
            <MoneyInput id="priceCents" placeholder={t("price.placeholder")} cents={field.value} onCents={field.onChange} min={PRICE_FLOOR_CENTS / CENTS_PER_EURO} invalid={fieldState.invalid} describedBy={describedBy("priceCents", error, hint)} />
          </FormField>
        );
      }} />
      <div className="grid gap-1">
        <p className="text-small font-medium text-ink">{t("bundles.title")}</p>
        <p className="text-caption text-ink-muted">{bundles.fields.length === 0 ? t("bundles.empty") : t("bundles.description")}</p>
      </div>
      {bundles.fields.map((field, index) => (
        <BundleFields key={field.id} index={index} control={control} priceCents={priceCents} onRemove={() => bundles.remove(index)}
          bundle={{ posts: live.bundles?.[index]?.posts ?? field.posts, totalCents: live.bundles?.[index]?.totalCents ?? field.totalCents }} />
      ))}
      {bundles.fields.length < MAX_BUNDLES ? (
        <Button type="button" variant="secondary" className="justify-self-start" onClick={() => bundles.append(defaultBundle(priceCents || recommendedCents || PRICE_FLOOR_CENTS))}>
          <Plus aria-hidden="true" />{t("bundles.add")}
        </Button>
      ) : <p className="text-caption text-ink-muted">{t("bundles.limit", { count: MAX_BUNDLES })}</p>}
    </div>
  );
}
