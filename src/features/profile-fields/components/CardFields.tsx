"use client";

import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { COUNTRIES, HEADLINE_MAX, MAX_INDUSTRIES } from "@/features/creator-onboarding/constants";
import type { CardInput } from "@/features/creator-onboarding/schemas";
import { INDUSTRIES } from "@/features/workspace/constants";
import { fieldError } from "./field-error";
import { describedBy, FormField } from "./FormField";
import { IndustryPicker } from "./IndustryPicker";
import { PenLine } from "lucide-react";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

// cardSchema: headline, country, up to three industries.
export function CardFields({ control }: { control: Control<CardInput> }) {
  const t = useTranslations("settings.creator.card");
  return (
    <div className="grid gap-5">
      <Controller control={control} name="headline" render={({ field, fieldState }) => {
        const error = fieldError(fieldState.error, { too_small: t("errors.headlineRequired"), too_big: t("errors.headlineMax", { max: HEADLINE_MAX }) });
        return (
          <FormField id="headline" label={t("headline.label")} hint={t("headline.help")} error={error}>
            <Input id="headline" leadingIcon={<PenLine />} placeholder={t("headline.placeholder")} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("headline", error, "x")} {...field} />
          </FormField>
        );
      }} />
      <Controller control={control} name="country" render={({ field, fieldState }) => (
        <FormField id="country" label={t("country.label")} error={fieldState.error ? t("errors.countryRequired") : undefined}>
          <Combobox id="country" options={COUNTRY_OPTIONS} value={field.value ?? null} onValueChange={(v) => field.onChange(v ?? undefined)} placeholder={t("country.placeholder")} emptyText={t("country.empty")} />
        </FormField>
      )} />
      <Controller control={control} name="industries" render={({ field, fieldState }) => (
        <IndustryPicker name="industries" group="industries" options={INDUSTRIES} legend={t("industries.label")} help={t("industries.help", { max: MAX_INDUSTRIES })} counter={t("industries.counter", { count: field.value.length, max: MAX_INDUSTRIES })}
          value={field.value} onChange={field.onChange} max={MAX_INDUSTRIES}
          error={fieldError(fieldState.error, { too_small: t("errors.industriesMin"), too_big: t("errors.industriesMax", { max: MAX_INDUSTRIES }) })} />
      )} />
    </div>
  );
}
