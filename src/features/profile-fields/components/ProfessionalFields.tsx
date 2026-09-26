"use client";

import { useTranslations } from "next-intl";
import { type Control, Controller, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, EU_COUNTRY_CODES, LEGAL_ADDRESS_MAX } from "@/features/creator-onboarding/constants";
import type { ProfessionalInput } from "@/features/creator-onboarding/schemas";
import { describedBy, FormField } from "./FormField";
import { Building2 } from "lucide-react";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
type Box = "registeredBusiness" | "taxAcknowledged" | "invoicingAuthorized";

function CheckField({ control, name, text, error }: { control: Control<ProfessionalInput>; name: Box; text: string; error?: string }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <div className="grid gap-1">
        <label htmlFor={name} className="flex items-start gap-3 text-small text-ink">
          <Checkbox id={name} className="mt-0.5" checked={field.value === true} onCheckedChange={(checked) => field.onChange(checked === true)} aria-invalid={fieldState.invalid || undefined} />
          <span>{text}</span>
        </label>
        {fieldState.error && error ? <p role="alert" className="pl-7 text-caption text-failure">{error}</p> : null}
      </div>
    )} />
  );
}

// professionalSchema: who invoices the brand — tax country, business or
// individual, legal name and address, and the two acknowledgements.
export function ProfessionalFields({ control }: { control: Control<ProfessionalInput> }) {
  const t = useTranslations("settings.creator.business");
  const country = useWatch({ control, name: "legalCountry" });
  const eu = EU_COUNTRY_CODES.has(country);
  return (
    <div className="grid gap-5">
      <p className="rounded-card border border-rule bg-paper p-4 text-small text-ink-muted">{t("requiredNote")}</p>
      <Controller control={control} name="legalCountry" render={({ field, fieldState }) => (
        <FormField id="legalCountry" label={t("legalCountry.label")} error={fieldState.error ? t("errors.countryRequired") : undefined}>
          <Combobox id="legalCountry" options={COUNTRY_OPTIONS} value={field.value ?? null} onValueChange={(v) => field.onChange(v ?? undefined)} placeholder={t("legalCountry.placeholder")} emptyText={t("legalCountry.placeholder")} />
        </FormField>
      )} />
      <div className="grid gap-1">
        <CheckField control={control} name="registeredBusiness" text={t("registeredBusiness.label")} />
        <p className="pl-7 text-caption text-ink-muted">{eu ? t("registeredBusiness.helpEu") : t("registeredBusiness.helpOutside")}</p>
      </div>
      <Controller control={control} name="legalName" render={({ field, fieldState }) => (
        <FormField id="legalName" label={t("legalName.label")} hint={t("legalName.help")} error={fieldState.error ? t("errors.legalNameRequired") : undefined}>
          <Input id="legalName" leadingIcon={<Building2 />} placeholder={t("legalName.placeholder")} autoComplete="organization" aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("legalName", fieldState.error?.message, "x")} {...field} />
        </FormField>
      )} />
      <Controller control={control} name="legalAddress" render={({ field, fieldState }) => (
        <FormField id="legalAddress" label={t("legalAddress.label")} error={fieldState.error ? t("errors.legalAddressRequired") : undefined}>
          <Textarea id="legalAddress" rows={3} maxLength={LEGAL_ADDRESS_MAX} autoComplete="street-address" placeholder={t("legalAddress.placeholder")} aria-invalid={fieldState.invalid || undefined} {...field} />
        </FormField>
      )} />
      <CheckField control={control} name="taxAcknowledged" text={t("taxAcknowledged.label")} error={t("errors.confirm")} />
      <CheckField control={control} name="invoicingAuthorized" text={t("invoicingAuthorized.label")} error={t("errors.confirm")} />
    </div>
  );
}
