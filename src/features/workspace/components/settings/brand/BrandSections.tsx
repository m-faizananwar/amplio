"use client";

import { Building2, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import type { z } from "zod";
import { Input } from "@/components/ui/input";
import { type ProfileInput, profileSchema } from "@/features/brand-onboarding/schemas";
import { completeOnboarding } from "@/features/brand-onboarding/server/actions";
import { BrandProfileFields } from "@/features/profile-fields/components/BrandProfileFields";
import { fieldError } from "@/features/profile-fields/components/field-error";
import { FormField } from "@/features/profile-fields/components/FormField";
import { IndustryPicker } from "@/features/profile-fields/components/IndustryPicker";
import { INDUSTRIES, REGIONS } from "../../../constants";
import { brandAudienceSchema, type BrandCompanyInput, brandCompanySchema } from "../../../schemas";
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
              <Input id="company" leadingIcon={<Building2 />} placeholder={t("company.companyName.placeholder")} autoComplete="organization" aria-invalid={fieldState.invalid || undefined} {...field} />
            </FormField>
          )} />
          <Controller control={form.control} name="website" render={({ field, fieldState }) => (
            <FormField id="website" label={t("company.website.label")} error={fieldState.error ? t("company.errors.websiteFormat") : undefined}>
              <Input id="website" leadingIcon={<Globe />} type="url" inputMode="url" placeholder={t("company.website.placeholder")} aria-invalid={fieldState.invalid || undefined} {...field} />
            </FormField>
          )} />
        </div>
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}

// Who the brand sells to, in one form: the value proposition and three ideal
// customers (saved through onboarding's own idempotent action), then where
// those buyers are (industries and regions, which rank creators).
const customersSchema = profileSchema.extend(brandAudienceSchema.shape);
type CustomersInput = z.infer<typeof customersSchema>;

async function saveCustomers(v: CustomersInput) {
  const profile = await completeOnboarding({ valueProp: v.valueProp, icps: v.icps });
  if (!profile.ok) return profile;
  return updateBrandAudience({ targetIndustries: v.targetIndustries, targetRegions: v.targetRegions });
}

export function CustomersSection({ defaults }: { defaults: CustomersInput }) {
  const t = useTranslations("settings.brand");
  const { form, onSubmit } = useSectionForm({ schema: customersSchema, defaults, save: saveCustomers, saved: t("states.saved") });
  const counter = (n: number) => (n === 0 ? t("audience.noneSelected") : String(n));
  return (
    <SettingsSection id="customers" title={t("customers.title")} description={t("customers.description")}>
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        {/* BrandProfileFields is typed to the profile schema; this form holds it plus the audience, so its control is a superset */}
        <BrandProfileFields control={form.control as unknown as Control<ProfileInput>} />
        <Controller control={form.control} name="targetIndustries" render={({ field }) => (
          <IndustryPicker name="targetIndustries" group="industries" options={INDUSTRIES} legend={t("audience.industries.label")} help={t("audience.industries.help")} counter={counter(field.value.length)} value={field.value} onChange={field.onChange} max={INDUSTRIES.length} />
        )} />
        <Controller control={form.control} name="targetRegions" render={({ field }) => (
          <IndustryPicker name="targetRegions" group="regions" options={REGIONS} legend={t("audience.regions.label")} help={t("audience.regions.help")} counter={counter(field.value.length)} value={field.value} onChange={field.onChange} max={REGIONS.length} />
        )} />
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}
