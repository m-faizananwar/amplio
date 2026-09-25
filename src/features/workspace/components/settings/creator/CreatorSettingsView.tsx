import { getTranslations } from "next-intl/server";
import type { CardInput, PriceInput, ProfessionalInput } from "@/features/creator-onboarding/schemas";
import type { CreatorSettings } from "../../../server/settings-queries";
import { AccountSection } from "../shared/AccountSection";
import { SettingsIndex } from "../shared/SettingsIndex";
import { PayoutSection } from "./PayoutSection";
import { BusinessSection, CardSection, IdentitySection, LinkedinSection, PricingSection } from "./ProfileSections";

type Props = { settings: CreatorSettings; isDemo: boolean; recommendedCents: number };

// Creator settings: the onboarding fields, section by section, then what
// onboarding doesn't ask (payouts, account). An index on wide screens.
export async function CreatorSettingsView({ settings: s, isDemo, recommendedCents }: Props) {
  const t = await getTranslations("settings.creator");
  const sections = ["you", "linkedin", "card", "pricing", "business", "payouts", "account"].map((id) => ({ id, label: t(`${id}.title`) }));
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
        <IdentitySection defaults={{ firstName: s.firstName, lastName: s.lastName, xHandle: s.xHandle }} />
        <LinkedinSection defaults={{ linkedinUrl: s.linkedinUrl }} source={s.profileSource} />
        <CardSection defaults={{ headline: s.headline, country: s.country as CardInput["country"], industries: s.industries as CardInput["industries"] }} />
        <PricingSection defaults={{ priceCents: s.priceCents, bundles: s.bundles as PriceInput["bundles"] }} recommendedCents={recommendedCents} />
        <BusinessSection defaults={professional} />
        <PayoutSection defaults={s.payout} />
        <AccountSection role="creator" email={s.email} handle={s.handle} isDemo={isDemo} />
      </div>
    </div>
  );
}
