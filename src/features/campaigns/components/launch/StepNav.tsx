import { Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";
import { LAUNCH_STEPS, type LaunchStepKey } from "../../constants";

// The step rail: done steps link back, the current one is ink, the rest wait.
export async function StepNav({ campaignId, active }: { campaignId: string; active: LaunchStepKey }) {
  const t = await getTranslations("brand.campaigns.launch.steps");
  const activeIndex = LAUNCH_STEPS.findIndex((s) => s.key === active);
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label={t("label")}>
      {LAUNCH_STEPS.map((step, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        const inner = (
          <>
            <span className={cn("num grid size-5 place-items-center rounded-full text-caption", done ? "bg-money text-paper" : current ? "bg-ink text-paper" : "bg-tint text-ink-muted")} aria-hidden="true">
              {done ? <Check className="size-3" /> : i + 1}
            </span>
            <span className={current ? "font-medium text-ink" : "text-ink-muted"}>{t(step.key)}</span>
          </>
        );
        return (
          <li key={step.key} className="flex items-center gap-2 text-small" aria-current={current ? "step" : undefined}>
            {done ? <Link href={`/brand/campaigns/${campaignId}/launch?step=${step.key}`} className="flex items-center gap-2 hover:underline">{inner}</Link> : <span className="flex items-center gap-2">{inner}</span>}
            {i < LAUNCH_STEPS.length - 1 ? <span className="mx-1 h-px w-6 bg-rule-strong" aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
