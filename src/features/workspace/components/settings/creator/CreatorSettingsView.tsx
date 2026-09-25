import type { CreatorSettings } from "../../../server/settings-queries";
import { AccountSection } from "./AccountSection";
import { PayoutSection } from "./PayoutSection";
import { BusinessSection, CardSection, IdentitySection, LinkedinSection, PricingSection } from "./ProfileSections";
import { SettingsIndex } from "./SettingsIndex";
import type { CardInput, PriceInput, ProfessionalInput } from "@/features/creator-onboarding/schemas";

type Props = { settings: CreatorSettings; isDemo: boolean; recommendedCents: number };

const SECTIONS = [
  { id: "you", label: "You" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "card", label: "Card" },
  { id: "pricing", label: "Pricing" },
  { id: "business", label: "Business" },
  { id: "payouts", label: "Payouts" },
  { id: "account", label: "Account" },
];

// Creator settings: the onboarding fields, section by section, then what
// onboarding doesn't ask (payouts, account). An index on wide screens.
export function CreatorSettingsView({ settings: s, isDemo, recommendedCents }: Props) {
  const professional: ProfessionalInput = {
    legalCountry: (s.professional.legalCountry ?? s.country) as ProfessionalInput["legalCountry"],
    registeredBusiness: s.professional.registeredBusiness,
    legalName: s.professional.legalName,
    legalAddress: s.professional.legalAddress,
    taxAcknowledged: s.professional.taxAcknowledged as true,
    invoicingAuthorized: s.professional.invoicingAuthorized as true,
  };
  return (
    <div className="grid gap-8 animate-rise lg:grid-cols-[12rem_minmax(0,1fr)]">
      <SettingsIndex sections={SECTIONS} />
      <div className="grid gap-5">
        <IdentitySection defaults={{ firstName: s.firstName, lastName: s.lastName, xHandle: s.xHandle }} />
        <LinkedinSection defaults={{ linkedinUrl: s.linkedinUrl }} />
        <CardSection defaults={{ headline: s.headline, country: s.country as CardInput["country"], industries: s.industries as CardInput["industries"] }} />
        <PricingSection defaults={{ priceCents: s.priceCents, bundles: s.bundles as PriceInput["bundles"] }} recommendedCents={recommendedCents} />
        <BusinessSection defaults={professional} />
        <PayoutSection defaults={s.payout} />
        <AccountSection email={s.email} handle={s.handle} isDemo={isDemo} removes="Removes your card, your collaborations and your ledger. It can't be undone." />
      </div>
    </div>
  );
}
