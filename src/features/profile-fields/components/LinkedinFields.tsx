"use client";

import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { LinkedinInput } from "@/features/creator-onboarding/schemas";
import { fieldError } from "./field-error";
import { describedBy, FormField } from "./FormField";

// linkedinSchema: the public profile URL. Onboarding step 1, Settings › LinkedIn.
export function LinkedinFields({ control }: { control: Control<LinkedinInput> }) {
  const t = useTranslations("settings.creator.linkedin");
  return (
    <Controller
      control={control}
      name="linkedinUrl"
      render={({ field, fieldState }) => {
        const error = fieldError(fieldState.error, { too_small: t("errors.required"), too_big: t("errors.tooLong"), invalid_format: t("errors.format") }, t("errors.format"));
        return (
          <FormField id="linkedinUrl" label={t("url.label")} hint={t("url.help")} error={error}>
            <Input id="linkedinUrl" type="url" inputMode="url" autoComplete="url" placeholder={t("url.placeholder")} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("linkedinUrl", error, "x")} {...field} />
          </FormField>
        );
      }}
    />
  );
}
