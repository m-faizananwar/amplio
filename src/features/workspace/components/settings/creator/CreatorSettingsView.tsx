import { getTranslations } from "next-intl/server";
import type { CardInput, PriceInput, ProfessionalInput } from "@/features/creator-onboarding/schemas";
import type { CreatorSettings } from "../../../server/settings-queries";
import { AccountSection } from "../shared/AccountSection";
import { SettingsIndex } from "../shared/SettingsIndex";
import { GettingPaidSection } from "./GettingPaidSection";
import { CardSection, LinkedinSection, PricingSection } from "./ProfileSections";

type Props = { settings: CreatorSettings; isDemo: boolean; recommendedCents: number };

// Creator settings in five sections, one topic each: your card (name and what
// brands see), the LinkedIn read, pricing, getting paid (payout method and
// the legal details invoices need), the account. An index on wide screens.
export async function CreatorSettingsView({ settings: s, isDemo, recommendedCents }: Props) {
  const t = await getTranslations("settings.creator");
  const sections = ["card", "linkedin", "pricing", "payouts", "account"].map((id) => ({ id, label: t(`${id === "payouts" ? "gettingPaid" : id}.title`) }));
  const professional: ProfessionalInput = {
    legalCountry: (s.professional.legalCountry ?? s.country) as ProfessionalInput["legalCountry"],
    registeredBusiness: s.professional.registeredBusiness,
    legalName: s.professional.legalName,
    legalAddress: s.professional.legalAddress,
    // the form starts from what's stored; the schema still demands `true` on save
    taxAcknowledged: s.professional.taxAcknowledged as true,
    invoicingAuthorized: s.professional.invoicingAuthorized as true,
  };
  return (
    <div className="grid gap-8 animate-rise lg:grid-cols-[12rem_minmax(0,1fr)]">
      <SettingsIndex label={t("indexLabel")} sections={sections} />
      <div className="grid gap-5">
        <CardSection picture={s.avatarUrl} defaults={{ firstName: s.firstName, lastName: s.lastName, xHandle: s.xHandle, headline: s.headline, country: s.country as CardInput["country"], industries: s.industries as CardInput["industries"] }} />
        <LinkedinSection defaults={{ linkedinUrl: s.linkedinUrl }} source={s.profileSource} />
        <PricingSection defaults={{ priceCents: s.priceCents, bundles: s.bundles as PriceInput["bundles"] }} recommendedCents={recommendedCents} />
        <GettingPaidSection payout={s.payout} business={professional} />
        <AccountSection role="creator" email={s.email} handle={s.handle} isDemo={isDemo} />
      </div>
    </div>
  );
}
