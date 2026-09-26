import { getTranslations } from "next-intl/server";
import type { ProfileInput } from "@/features/brand-onboarding/schemas";
import type { BrandAudienceInput } from "../../../schemas";
import type { BrandSettings } from "../../../server/settings-queries";
import { AccountSection } from "../shared/AccountSection";
import { SettingsIndex } from "../shared/SettingsIndex";
import { CompanySection, CustomersSection } from "./BrandSections";

type Props = { settings: BrandSettings; email: string; isDemo: boolean };

// Brand settings in three sections: the company, who you sell to (value
// proposition, ideal customers and where they are, one form), the account.
export async function BrandSettingsView({ settings: s, email, isDemo }: Props) {
  const t = await getTranslations("settings.brand");
  const sections = [
    { id: "company", label: t("company.title") },
    { id: "customers", label: t("customers.title") },
    { id: "account", label: t("account.title") },
  ];
  const icps = [0, 1, 2].map((i) => s.icps[i] ?? { title: "", description: "" });
  return (
    <div className="grid gap-8 animate-rise lg:grid-cols-[12rem_minmax(0,1fr)]">
      <SettingsIndex label={t("indexLabel")} sections={sections} />
      <div className="grid gap-5">
        <CompanySection logo={s.logoUrl} defaults={{ company: s.company, website: s.website }} />
        <CustomersSection defaults={{ valueProp: s.valueProp, icps, targetIndustries: s.targetIndustries, targetRegions: s.targetRegions } as ProfileInput & BrandAudienceInput} />
        <AccountSection role="brand" email={email} isDemo={isDemo} />
      </div>
    </div>
  );
}
