import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { StepRail } from "@/components/flow/StepRail";
import { AuthColumn } from "@/features/auth/components/AuthColumn";

export type CreatorStepKey = "linkedin" | "card" | "price" | "legal";
const RAIL_INDEX: Record<CreatorStepKey, number> = { linkedin: 1, card: 2, price: 3, legal: 4 };

// Every creator onboarding screen: the rail carried on from sign-up, a back
// link, the step's title and one sentence, then the step's form.
export async function CreatorStep({ step, back, children }: { step: CreatorStepKey; back?: string; children: ReactNode }) {
  const [t, tAuth, tCommon] = await Promise.all([getTranslations(`onboarding.creator.${step}`), getTranslations("auth.signUp"), getTranslations("onboarding")]);
  const steps = tAuth.raw("stepsCreator") as string[];
  const current = RAIL_INDEX[step];
  return (
    <AuthColumn wide rail={<StepRail steps={steps} current={current} label={tCommon("rail.label")} stepOf={tCommon("rail.stepOf", { current: current + 1, total: steps.length })} />}>
      {back ? (
        <Link href={back} className="mb-6 inline-flex items-center gap-1.5 text-small text-ink-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" />{tCommon("common.back")}
        </Link>
      ) : null}
      <h1 className="text-h2">{t("title")}</h1>
      <p className="mt-2 text-ink-muted">{t("sub")}</p>
      <div className="mt-8">{children}</div>
    </AuthColumn>
  );
}
