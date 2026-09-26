"use client";

import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { VALUE_PROP_MAX_CHARS } from "@/features/brand-onboarding/constants";
import type { ProfileInput } from "@/features/brand-onboarding/schemas";
import { fieldError } from "./field-error";
import { describedBy, FormField } from "./FormField";
import { IcpCards } from "./icp/IcpCards";

// profileSchema: the value proposition and the three ideal customers.
export function BrandProfileFields({ control }: { control: Control<ProfileInput> }) {
  const t = useTranslations("settings.brand.company.valueProp");
  const te = useTranslations("settings.brand.company.errors");
  return (
    <div className="grid gap-5">
      <Controller control={control} name="valueProp" render={({ field, fieldState }) => {
        const error = fieldError(fieldState.error, { too_small: te("valuePropRequired"), too_big: te("valuePropTooLong", { max: VALUE_PROP_MAX_CHARS }) });
        return (
          <FormField id="valueProp" label={t("label")} hint={t("help")} error={error}>
            <Textarea id="valueProp" rows={5} maxLength={VALUE_PROP_MAX_CHARS} placeholder={t("placeholder")} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("valueProp", error, "x")} {...field} />
          </FormField>
        );
      }} />
      <IcpCards control={control} />
    </div>
  );
}
