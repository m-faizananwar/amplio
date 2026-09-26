"use client";

import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ICP_COUNT, ICP_DESCRIPTION_MAX_CHARS, ICP_TITLE_MAX_CHARS, VALUE_PROP_MAX_CHARS } from "@/features/brand-onboarding/constants";
import type { ProfileInput } from "@/features/brand-onboarding/schemas";
import { fieldError } from "./field-error";
import { describedBy, FormField } from "./FormField";
import { Users } from "lucide-react";

const INDEXES = Array.from({ length: ICP_COUNT }, (_, i) => i);

function IcpFields({ control, index }: { control: Control<ProfileInput>; index: number }) {
  const t = useTranslations("settings.brand.idealCustomers");
  const n = index + 1;
  return (
    <fieldset className="grid gap-3 rounded-card border border-rule bg-paper p-4">
      <legend className="flex items-center gap-2 text-small font-medium text-ink">
        <span aria-hidden="true" className="num grid size-5 place-items-center rounded-chip bg-ink text-caption text-paper">{n}</span>
        {t("item", { count: n })}
      </legend>
      <Controller control={control} name={`icps.${index}.title`} render={({ field, fieldState }) => {
        const error = fieldError(fieldState.error, { too_small: t("errors.nameRequired"), too_big: t("errors.nameTooLong", { max: ICP_TITLE_MAX_CHARS }) });
        return (
          <FormField id={`icp-${n}-title`} label={t("name.label")} error={error}>
            <Input id={`icp-${n}-title`} leadingIcon={<Users />} placeholder={t("name.placeholder")} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy(`icp-${n}-title`, error)} {...field} />
          </FormField>
        );
      }} />
      <Controller control={control} name={`icps.${index}.description`} render={({ field, fieldState }) => {
        const error = fieldError(fieldState.error, { too_small: t("errors.detailsRequired"), too_big: t("errors.detailsTooLong", { max: ICP_DESCRIPTION_MAX_CHARS }) });
        return (
          <FormField id={`icp-${n}-description`} label={t("details.label")} error={error}>
            <Textarea id={`icp-${n}-description`} rows={3} placeholder={t("details.placeholder")} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy(`icp-${n}-description`, error)} {...field} />
          </FormField>
        );
      }} />
    </fieldset>
  );
}

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
            <Textarea id="valueProp" rows={5} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("valueProp", error, "x")} {...field} />
          </FormField>
        );
      }} />
      <div className="grid gap-3 lg:grid-cols-3">{INDEXES.map((i) => <IcpFields key={i} control={control} index={i} />)}</div>
    </div>
  );
}
