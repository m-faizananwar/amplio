"use client";

import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { WebsiteInput } from "@/features/brand-onboarding/schemas";
import { fieldError } from "./field-error";
import { describedBy, FormField } from "./FormField";

// websiteSchema: the company website the AI draft is read from.
export function WebsiteFields({ control }: { control: Control<WebsiteInput> }) {
  const t = useTranslations("settings.brand.company");
  return (
    <Controller control={control} name="url" render={({ field, fieldState }) => {
      const error = fieldError(fieldState.error, { too_small: t("errors.websiteRequired"), too_big: t("errors.websiteTooLong"), invalid_format: t("errors.websiteFormat") }, t("errors.websiteFormat"));
      return (
        <FormField id="website" label={t("website.label")} hint={t("website.help")} error={error}>
          <Input id="website" type="url" inputMode="url" autoComplete="url" placeholder={t("website.placeholder")} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("website", error, "x")} {...field} value={field.value ?? ""} />
        </FormField>
      );
    }} />
  );
}
