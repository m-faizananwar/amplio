import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StepRail } from "@/components/flow/StepRail";
import { WizardShell } from "@/components/flow/WizardShell";
import { ErrorState } from "@/components/page/ErrorState";
import { BrandSetup } from "@/features/brand-onboarding/components/BrandSetup";
import { ONBOARDING_ROUTES } from "@/features/brand-onboarding/constants";
import { getBrandLogo, loadOnboardingProfile } from "@/features/brand-onboarding/server/queries";
import { requireOnboardingBrand } from "@/features/brand-onboarding/server/require-onboarding-brand";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("onboarding.brand"))("meta") };
}

// The whole brand onboarding: website in, draft out, on one screen. The rail
// moves from Website to Profile once there is a draft.
export default async function BrandOnboardingPage() {
  const viewer = await requireOnboardingBrand(ONBOARDING_ROUTES.website);
  const [profile, logo, t, tAuth] = await Promise.all([loadOnboardingProfile(viewer.brand.id), getBrandLogo(viewer.brand.id), getTranslations("onboarding"), getTranslations("auth.signUp")]);
  const hasDraft = !!profile && (!!profile.website && (profile.valueProp.trim().length > 0 || profile.icps.some((i) => i.title.trim())));
  const steps = tAuth.raw("stepsBrand") as string[];
  const current = hasDraft ? 2 : 1;
  return (
    <WizardShell
      rail={<StepRail steps={steps} current={current} label={t("rail.label")} stepOf={t("rail.stepOf", { current: current + 1, total: steps.length })} />}
      eyebrow={t("eyebrows.brand")}
      title={t("brand.title")}
      sub={t("brand.sub")}
    >
      {profile ? <BrandSetup profile={profile} hasDraft={hasDraft} logo={logo} /> : <div data-area="fields"><ErrorState body="Your brand workspace could not be loaded. The database may be unreachable." retryHref={ONBOARDING_ROUTES.website} /></div>}
    </WizardShell>
  );
}
