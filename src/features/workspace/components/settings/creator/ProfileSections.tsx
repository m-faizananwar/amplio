"use client";

import { AtSign, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { type Control, Controller } from "react-hook-form";
import type { z } from "zod";
import { Input } from "@/components/ui/input";
import { readLinkedinProfile, saveCreatorCard, savePricing } from "@/features/creator-onboarding/server/actions";
import { type CardInput, cardSchema, type LinkedinInput, linkedinSchema, type PriceInput, priceSchema } from "@/features/creator-onboarding/schemas";
import { CardFields } from "@/features/profile-fields/components/CardFields";
import { FormField } from "@/features/profile-fields/components/FormField";
import { LinkedinFields } from "@/features/profile-fields/components/LinkedinFields";
import { PriceFields } from "@/features/profile-fields/components/PriceFields";
import { type CreatorIdentityInput, creatorIdentitySchema } from "../../../schemas";
import { updateCreatorIdentity } from "../../../server/actions";
import { SaveRow } from "../shared/SaveRow";
import { SettingsSection } from "../shared/SettingsSection";
import { useSectionForm } from "../shared/useSectionForm";
import type { ProfileSource } from "@/lib/profile-source";
import { PictureField } from "@/features/profile-fields/components/PictureField";
import { saveCreatorPicture } from "@/features/creator-onboarding/server/actions";
import { isChosenPicture } from "@/lib/avatar";

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

// Who you are and what brands see first, in one form: the name (identity)
// and the card (headline, country, industries) save through their own
// actions, one after the other.
const yourCardSchema = creatorIdentitySchema.extend(cardSchema.shape);
type YourCardInput = z.infer<typeof yourCardSchema>;

async function saveYourCard(v: YourCardInput) {
  const identity = await updateCreatorIdentity({ firstName: v.firstName, lastName: v.lastName, xHandle: v.xHandle });
  if (!identity.ok) return identity;
  return saveCreatorCard({ headline: v.headline, country: v.country, industries: v.industries });
}

export function CardSection({ defaults, picture }: { defaults: YourCardInput; picture: string }) {
  const t = useTranslations("settings.creator");
  const { form, onSubmit } = useSectionForm({ schema: yourCardSchema, defaults, save: saveYourCard, saved: t("states.saved") });
  const icons: Record<keyof CreatorIdentityInput, ReactNode> = { firstName: <UserRound />, lastName: <UserRound />, xHandle: <AtSign /> };
  const text = (name: keyof CreatorIdentityInput, copy: { label: string; placeholder: string; hint?: string }) => (
    <Controller control={form.control} name={name} render={({ field, fieldState }) => (
      <FormField id={name} label={copy.label} hint={copy.hint} error={fieldState.error ? (name === "xHandle" ? fieldState.error.message : t("card.errors.firstNameRequired")) : undefined}>
        <Input id={name} leadingIcon={icons[name]} placeholder={copy.placeholder} aria-invalid={fieldState.invalid || undefined} {...field} />
      </FormField>
    )} />
  );
  return (
    <SettingsSection id="card" title={t("card.title")} description={t("card.description")}>
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <PictureField kind="photo" initial={isChosenPicture(picture) ? picture : null} save={saveCreatorPicture} />
        <div className="grid gap-5 sm:grid-cols-2">
          {text("firstName", { label: t("card.firstName.label"), placeholder: t("card.firstName.placeholder") })}
          {text("lastName", { label: t("card.lastName.label"), placeholder: t("card.lastName.placeholder") })}
        </div>
        {/* CardFields is typed to the card schema; this form holds it plus the name, so its control is a superset */}
        <CardFields control={form.control as unknown as Control<CardInput>} />
        {text("xHandle", { label: t("you.xHandle.label"), placeholder: t("you.xHandle.placeholder"), hint: t("you.xHandle.help") })}
        <SaveRow form={form} />
      </form>
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
