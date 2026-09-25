"use client";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { readLinkedinProfile, saveCreatorCard, savePricing, saveProfessionalInfo } from "@/features/creator-onboarding/server/actions";
import { type CardInput, cardSchema, type LinkedinInput, linkedinSchema, type PriceInput, priceSchema, type ProfessionalInput, professionalSchema } from "@/features/creator-onboarding/schemas";
import { CardFields } from "@/features/profile-fields/components/CardFields";
import { FormField } from "@/features/profile-fields/components/FormField";
import { LinkedinFields } from "@/features/profile-fields/components/LinkedinFields";
import { PriceFields } from "@/features/profile-fields/components/PriceFields";
import { ProfessionalFields } from "@/features/profile-fields/components/ProfessionalFields";
import { type CreatorIdentityInput, creatorIdentitySchema } from "../../../schemas";
import { updateCreatorIdentity } from "../../../server/actions";
import { SaveRow } from "../shared/SaveRow";
import { SettingsSection } from "../shared/SettingsSection";
import { useSectionForm } from "../shared/useSectionForm";
import type { ProfileSource } from "@/lib/profile-source";

export function IdentitySection({ defaults }: { defaults: CreatorIdentityInput }) {
  const t = useTranslations("settings.creator");
  const { form, onSubmit } = useSectionForm({ schema: creatorIdentitySchema, defaults, save: updateCreatorIdentity, saved: t("states.saved") });
  const text = (name: keyof CreatorIdentityInput, label: string, hint?: string) => (
    <Controller control={form.control} name={name} render={({ field, fieldState }) => (
      <FormField id={name} label={label} hint={hint} error={fieldState.error ? (name === "xHandle" ? fieldState.error.message : t("card.errors.firstNameRequired")) : undefined}>
        <Input id={name} aria-invalid={fieldState.invalid || undefined} {...field} />
      </FormField>
    )} />
  );
  return (
    <SettingsSection id="you" title={t("you.title")} description={t("you.description")}>
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          {text("firstName", t("card.firstName.label"))}
          {text("lastName", t("card.lastName.label"))}
          {text("xHandle", t("you.xHandle.label"), t("you.xHandle.help"))}
        </div>
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}

export function LinkedinSection({ defaults, source }: { defaults: LinkedinInput; source: ProfileSource }) {
  const t = useTranslations("settings.creator.linkedin");
  const { form, onSubmit } = useSectionForm({ schema: linkedinSchema, defaults, save: readLinkedinProfile, saved: t("success") });
  return (
    <SettingsSection id="linkedin" title={t("title")} description={t("description")}>
      <form onSubmit={onSubmit} noValidate>
        <LinkedinFields control={form.control} />
        <p className="mt-3 text-caption text-ink-muted">{t(`source.${source}`)}</p>
        <SaveRow form={form} label={t("reread")} requireChange={false} />
      </form>
    </SettingsSection>
  );
}

export function CardSection({ defaults }: { defaults: CardInput }) {
  const t = useTranslations("settings.creator");
  const { form, onSubmit } = useSectionForm({ schema: cardSchema, defaults, save: saveCreatorCard, saved: t("states.saved") });
  return (
    <SettingsSection id="card" title={t("card.title")} description={t("card.description")}>
      <form onSubmit={onSubmit} noValidate><CardFields control={form.control} /><SaveRow form={form} /></form>
    </SettingsSection>
  );
}

export function PricingSection({ defaults, recommendedCents }: { defaults: PriceInput; recommendedCents: number }) {
  const t = useTranslations("settings.creator");
  const { form, onSubmit } = useSectionForm({ schema: priceSchema, defaults, save: savePricing, saved: t("states.saved") });
  return (
    <SettingsSection id="pricing" title={t("pricing.title")} description={t("pricing.description")}>
      <form onSubmit={onSubmit} noValidate><PriceFields control={form.control} recommendedCents={recommendedCents} /><SaveRow form={form} /></form>
    </SettingsSection>
  );
}

export function BusinessSection({ defaults }: { defaults: ProfessionalInput }) {
  const t = useTranslations("settings.creator");
  const { form, onSubmit } = useSectionForm({ schema: professionalSchema, defaults, save: saveProfessionalInfo, saved: t("states.saved") });
  return (
    <SettingsSection id="business" title={t("business.title")} description={t("business.description")}>
      <form onSubmit={onSubmit} noValidate><ProfessionalFields control={form.control} /><SaveRow form={form} /></form>
    </SettingsSection>
  );
}
