import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { StepRail } from "@/components/flow/StepRail";
import { WizardShell } from "@/components/flow/WizardShell";

export type CreatorStepKey = "linkedin" | "card" | "price" | "legal";
const RAIL_INDEX: Record<CreatorStepKey, number> = { linkedin: 1, card: 2, price: 3, legal: 4 };

// Every creator onboarding screen is the wizard card: the rail carried on from
// sign-up, the step's eyebrow, title and one sentence above its fields, and
// the creator's card beside them (the step's form renders both halves).
export async function CreatorStep({ step, children }: { step: CreatorStepKey; children: ReactNode }) {
  const [t, tAuth, tCommon] = await Promise.all([getTranslations(`onboarding.creator.${step}`), getTranslations("auth.signUp"), getTranslations("onboarding")]);
  const steps = tAuth.raw("stepsCreator") as string[];
  const current = RAIL_INDEX[step];
  return (
    <WizardShell
      rail={<StepRail steps={steps} current={current} label={tCommon("rail.label")} stepOf={tCommon("rail.stepOf", { current: current + 1, total: steps.length })} />}
      eyebrow={tCommon(`eyebrows.${step}`)}
      title={t("title")}
      sub={t("sub")}
    >
      {children}
    </WizardShell>
  );
}
