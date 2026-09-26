import { Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

type Plan = { explored: boolean; briefed: boolean; invited: boolean; stepsLeft: number };

const STEPS = [
  { key: "explore", done: (p: Plan) => p.explored, href: "/brand/creators" },
  { key: "brief", done: (p: Plan) => p.briefed, href: "/brand/campaigns/new" },
  { key: "invite", done: (p: Plan) => p.invited, href: "/brand/creators" },
] as const;

// Three steps to a first live post. Rendered only while one is left (the
// Overview doesn't mount it once stepsLeft is 0), so it never becomes furniture.
export async function SetupCard({ plan }: { plan: Plan }) {
  const t = await getTranslations("brand.overview.setup");
  const done = STEPS.length - plan.stepsLeft;
  return (
    <section aria-labelledby="setup-title" className="rounded-card border border-rule bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="setup-title" className="text-lead">{t("title")}</h2>
        <span className="num text-small text-ink-muted">{t("progress", { done, total: STEPS.length })}</span>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const complete = step.done(plan);
          return (
            <li key={step.key}>
              <Link href={step.href} className={cn("flex h-full items-start gap-3 rounded-control border border-rule p-3 outline-none transition-colors duration-(--duration-fast) hover:bg-tint focus-visible:ring-2 focus-visible:ring-money", complete && "bg-paper")}>
                <span className={cn("num grid size-6 shrink-0 place-items-center rounded-full border text-caption", complete ? "border-money bg-money text-paper" : "border-rule-strong text-ink-muted")} aria-hidden="true">
                  {complete ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span>
                  <span className={cn("block text-body font-medium", complete ? "text-ink-muted line-through" : "text-ink")}>{t(`steps.${step.key}.title`)}</span>
                  <span className="block text-small text-ink-muted">{t(`steps.${step.key}.body`)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
