import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { AuthColumn } from "@/features/auth/components/AuthColumn";
import { BrandSetup } from "@/features/brand-onboarding/components/BrandSetup";
import { ONBOARDING_ROUTES } from "@/features/brand-onboarding/constants";
import { loadOnboardingProfile } from "@/features/brand-onboarding/server/queries";
import { requireOnboardingBrand } from "@/features/brand-onboarding/server/require-onboarding-brand";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("onboarding.brand"))("meta") };
}

// The whole brand onboarding: website in, draft out, on one screen.
export default async function BrandOnboardingPage() {
  const viewer = await requireOnboardingBrand(ONBOARDING_ROUTES.website);
  const profile = await loadOnboardingProfile(viewer.brand.id);
  const hasDraft = !!profile && (!!profile.website && (profile.valueProp.trim().length > 0 || profile.icps.some((i) => i.title.trim())));
  return (
    <AuthColumn wide>
      {profile ? <BrandSetup profile={profile} hasDraft={hasDraft} /> : <ErrorState body="Your brand workspace could not be loaded. The database may be unreachable." retryHref={ONBOARDING_ROUTES.website} />}
    </AuthColumn>
  );
}
