import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SetupShell } from "@/components/flow/SetupShell";
import s from "@/components/flow/setup.module.css";
import { agentModeOn } from "@/config/flags";
import { brandSetup } from "@/lib/setup-steps";
import type { OnboardingProfileDto } from "../../schemas";
import { BrandSetup } from "../BrandSetup";

type Step = "website" | "profile";

// Brand setup inside the app: account (done), website, customers on the
// rail. Both steps are the one BrandSetup screen (website in, draft out); the
// rail opens on the customers once there is a draft to review.
export async function BrandSetupView({ profile, logo, step }: { profile: OnboardingProfileDto; logo: string | null; step?: string }) {
  const t = await getTranslations("onboarding");
  const hasDraft = !!profile.website && (profile.valueProp.trim().length > 0 || profile.icps.some((i) => i.title.trim()));
  const progress = brandSetup({ hasWebsite: !!profile.website, onboarded: profile.onboarded, completedAt: null });
  const current: Step = step === "website" || step === "profile" ? step : hasDraft ? "profile" : "website";
  const done = (k: string) => progress.steps.find((x) => x.key === k)?.done ?? false;
  const tabs = [
    { key: "account", title: t("setup.steps.account.title"), href: null, done: true },
    { key: "website", title: t("setup.steps.website.title"), href: "/brand/setup?step=website", done: done("website") },
    { key: "profile", title: t("setup.steps.profile.title"), href: hasDraft ? "/brand/setup?step=profile" : null, done: done("profile") },
  ];
  const foot = hasDraft && agentModeOn() ? (
    <p className={s.agent}>{t("setup.agent.brand")} <Link href="/brand/agent">{t("setup.agent.link")}</Link></p>
  ) : null;
  return (
    <SetupShell
      name={t("setup.brandTitle")}
      stepOf={t("setup.stepOf", { current: tabs.findIndex((x) => x.key === current) + 1, total: tabs.length })}
      title={t("brand.title")}
      sub={t("brand.sub")}
      railLabel={t("setup.railLabel")}
      doneLabel={t("setup.done")}
      tabs={tabs}
      current={current}
      foot={foot}
    >
      <BrandSetup profile={profile} hasDraft={hasDraft} logo={logo} />
    </SetupShell>
  );
}
