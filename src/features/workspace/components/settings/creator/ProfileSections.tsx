"use client";

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
import { SaveRow } from "./SaveRow";
import { SettingsSection } from "./SettingsSection";
import { useSectionForm } from "./useSectionForm";

export function IdentitySection({ defaults }: { defaults: CreatorIdentityInput }) {
  const { form, onSubmit } = useSectionForm({ schema: creatorIdentitySchema, defaults, save: updateCreatorIdentity, saved: "Name saved" });
  const text = (name: keyof CreatorIdentityInput, label: string, hint?: string) => (
    <Controller control={form.control} name={name} render={({ field, fieldState }) => (
      <FormField id={name} label={label} hint={hint} error={fieldState.error?.message}>
        <Input id={name} aria-invalid={fieldState.invalid || undefined} {...field} />
      </FormField>
    )} />
  );
  return (
    <SettingsSection id="you" title="You" description="How brands see your name on invitations, threads and invoices.">
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          {text("firstName", "First name")}
          {text("lastName", "Last name")}
          {text("xHandle", "X handle", "Optional. Shown on your card next to LinkedIn.")}
        </div>
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}

export function LinkedinSection({ defaults }: { defaults: LinkedinInput }) {
  const { form, onSubmit } = useSectionForm({ schema: linkedinSchema, defaults, save: readLinkedinProfile, saved: "Profile read again" });
  return (
    <SettingsSection id="linkedin" title="LinkedIn" description="Your audience figures come from this profile. In this version they are simulated from the URL, not fetched from LinkedIn.">
      <form onSubmit={onSubmit} noValidate>
        <LinkedinFields control={form.control} />
        <SaveRow form={form} label="Read my profile again" requireChange={false} />
      </form>
    </SettingsSection>
  );
}

export function CardSection({ defaults }: { defaults: CardInput }) {
  const { form, onSubmit } = useSectionForm({ schema: cardSchema, defaults, save: saveCreatorCard, saved: "Card saved" });
  return (
    <SettingsSection id="card" title="Card" description="The headline, country and industries brands filter and read.">
      <form onSubmit={onSubmit} noValidate>
        <CardFields control={form.control} />
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}

export function PricingSection({ defaults, recommendedCents }: { defaults: PriceInput; recommendedCents: number }) {
  const { form, onSubmit } = useSectionForm({ schema: priceSchema, defaults, save: savePricing, saved: "Prices saved" });
  return (
    <SettingsSection id="pricing" title="Pricing" description="New invitations use these prices. Bookings already made keep theirs.">
      <form onSubmit={onSubmit} noValidate>
        <PriceFields control={form.control} recommendedCents={recommendedCents} />
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}

export function BusinessSection({ defaults }: { defaults: ProfessionalInput }) {
  const { form, onSubmit } = useSectionForm({ schema: professionalSchema, defaults, save: saveProfessionalInfo, saved: "Business details saved" });
  return (
    <SettingsSection id="business" title="Business" description="Who invoices the brand. Needed before you withdraw.">
      <form onSubmit={onSubmit} noValidate>
        <ProfessionalFields control={form.control} />
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}
