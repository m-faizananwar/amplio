import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { ClientMessages } from "@/i18n/ClientMessages";
import { BrandSetupView } from "@/features/brand-onboarding/components/setup/BrandSetupView";
import { getBrandLogo, loadOnboardingProfile } from "@/features/brand-onboarding/server/queries";
import { requireOnboardingBrand } from "@/features/brand-onboarding/server/require-onboarding-brand";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${(await getTranslations("onboarding.setup"))("brandTitle")} · Amplio` };
}

// Setup inside the brand shell; ?step=website|profile opens a step.
export default async function BrandSetupPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const viewer = await requireOnboardingBrand("/brand/setup");
  const [profile, logo, { step }] = await Promise.all([loadOnboardingProfile(viewer.brand.id), getBrandLogo(viewer.brand.id), searchParams]);
  return (
    <ClientMessages namespaces={["onboarding", "settings"]}>
      {profile ? <BrandSetupView profile={profile} logo={logo} step={step} /> : <ErrorState body="Your brand workspace could not be loaded. The database may be unreachable." retryHref="/brand/setup" />}
    </ClientMessages>
  );
}
