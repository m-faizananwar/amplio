"use client";

import { type Control, Controller } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { COUNTRIES, MAX_INDUSTRIES } from "@/features/creator-onboarding/constants";
import type { CardInput } from "@/features/creator-onboarding/schemas";
import { describedBy, FormField } from "./FormField";
import { IndustryPicker } from "./IndustryPicker";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
const HEADLINE_HINT = "One line brands read first. Your LinkedIn headline is a good start.";

// cardSchema: headline, country, up to three industries.
export function CardFields({ control }: { control: Control<CardInput> }) {
  return (
    <div className="grid gap-5">
      <Controller
        control={control}
        name="headline"
        render={({ field, fieldState }) => (
          <FormField id="headline" label="Headline" hint={HEADLINE_HINT} error={fieldState.error?.message}>
            <Input id="headline" aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("headline", fieldState.error?.message, HEADLINE_HINT)} {...field} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="country"
        render={({ field, fieldState }) => (
          <FormField id="country" label="Country" error={fieldState.error?.message}>
            <Combobox
              id="country"
              options={COUNTRY_OPTIONS}
              value={field.value ?? null}
              onValueChange={(v) => field.onChange(v ?? undefined)}
              placeholder="Search a country"
              emptyText="No country matches"
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="industries"
        render={({ field, fieldState }) => (
          <IndustryPicker legend={`Industries (up to ${MAX_INDUSTRIES})`} value={field.value} onChange={field.onChange} max={MAX_INDUSTRIES} error={fieldState.error?.message} />
        )}
      />
    </div>
  );
}
