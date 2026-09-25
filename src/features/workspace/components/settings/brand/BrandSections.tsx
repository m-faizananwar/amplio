"use client";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { type ProfileInput, profileSchema } from "@/features/brand-onboarding/schemas";
import { completeOnboarding } from "@/features/brand-onboarding/server/actions";
import { BrandProfileFields } from "@/features/profile-fields/components/BrandProfileFields";
import { fieldError } from "@/features/profile-fields/components/field-error";
import { FormField } from "@/features/profile-fields/components/FormField";
import { IndustryPicker } from "@/features/profile-fields/components/IndustryPicker";
import { INDUSTRIES, REGIONS } from "../../../constants";
import { type BrandAudienceInput, brandAudienceSchema, type BrandCompanyInput, brandCompanySchema } from "../../../schemas";
import { updateBrandAudience, updateBrandCompany } from "../../../server/actions";
import { SaveRow } from "../shared/SaveRow";
import { SettingsSection } from "../shared/SettingsSection";
import { useSectionForm } from "../shared/useSectionForm";

export function CompanySection({ defaults }: { defaults: BrandCompanyInput }) {
  const t = useTranslations("settings.brand");
  const { form, onSubmit } = useSectionForm({ schema: brandCompanySchema, defaults, save: updateBrandCompany, saved: t("states.saved") });
  return (
    <SettingsSection id="company" title={t("company.title")} description={t("company.description")}>
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller control={form.control} name="company" render={({ field, fieldState }) => (
            <FormField id="company" label={t("company.companyName.label")} error={fieldError(fieldState.error, { too_small: t("company.errors.companyRequired"), too_big: t("company.errors.companyTooLong", { max: 120 }) })}>
              <Input id="company" autoComplete="organization" aria-invalid={fieldState.invalid || undefined} {...field} />
            </FormField>
          )} />
          <Controller control={form.control} name="website" render={({ field, fieldState }) => (
            <FormField id="website" label={t("company.website.label")} error={fieldState.error ? t("company.errors.websiteFormat") : undefined}>
              <Input id="website" type="url" inputMode="url" placeholder={t("company.website.placeholder")} aria-invalid={fieldState.invalid || undefined} {...field} />
            </FormField>
          )} />
        </div>
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}

// The onboarding profile — value proposition and three ideal customers —
// saved through onboarding's own (idempotent) action.
export function PositioningSection({ defaults }: { defaults: ProfileInput }) {
  const t = useTranslations("settings.brand");
  const { form, onSubmit } = useSectionForm({ schema: profileSchema, defaults, save: completeOnboarding, saved: t("states.saved") });
  return (
    <SettingsSection id="customers" title={t("idealCustomers.title")} description={t("idealCustomers.description", { count: 3 })}>
      <form onSubmit={onSubmit} noValidate><BrandProfileFields control={form.control} /><SaveRow form={form} /></form>
    </SettingsSection>
  );
}

export function AudienceSection({ defaults }: { defaults: BrandAudienceInput }) {
  const t = useTranslations("settings.brand");
  const { form, onSubmit } = useSectionForm({ schema: brandAudienceSchema, defaults, save: updateBrandAudience, saved: t("states.saved") });
  const counter = (n: number) => (n === 0 ? t("audience.noneSelected") : String(n));
  return (
    <SettingsSection id="audience" title={t("audience.title")} description={t("audience.description")}>
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <Controller control={form.control} name="targetIndustries" render={({ field }) => (
          <IndustryPicker name="targetIndustries" options={INDUSTRIES} legend={t("audience.industries.label")} help={t("audience.industries.help")} counter={counter(field.value.length)} value={field.value} onChange={field.onChange} max={INDUSTRIES.length} />
        )} />
        <Controller control={form.control} name="targetRegions" render={({ field }) => (
          <IndustryPicker name="targetRegions" options={REGIONS} legend={t("audience.regions.label")} help={t("audience.regions.help")} counter={counter(field.value.length)} value={field.value} onChange={field.onChange} max={REGIONS.length} />
        )} />
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}
