import { cn } from "@/lib/cn";

type Props = { steps: string[]; current: number; label: string; stepOf: string; className?: string };

// Progress through a flow as a trail (DIRECTION.md, onboarding): dots joined
// by one line; done steps are ink, the current one is green and ringed, the
// line fills up to it. Sign-up is step 1; onboarding carries on the same rail.
export function StepRail({ steps, current, label, stepOf, className }: Props) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;
  return (
    <nav aria-label={label} className={cn("w-full", className)}>
      <p className="sr-only">{stepOf}</p>
      <ol className="relative flex justify-between">
        <span aria-hidden="true" className="absolute left-[7px] right-[7px] top-[7px] h-px bg-rule" />
        <span aria-hidden="true" className="absolute left-[7px] top-[7px] h-px bg-ink transition-[width] duration-(--duration-slow) ease-ledger" style={{ width: `calc((100% - 14px) * ${pct / 100})` }} />
        {steps.map((step, i) => (
          <li key={step} aria-current={i === current ? "step" : undefined} className="relative flex flex-col items-center gap-2" style={{ width: 14 }}>
            <span
              aria-hidden="true"
              className={cn(
                "size-3.5 rounded-full border-2 transition-colors duration-(--duration-base)",
                i < current && "border-ink bg-ink",
                i === current && "border-money bg-money ring-4 ring-money-soft",
                i > current && "border-rule-strong bg-paper",
              )}
            />
            <span className={cn("whitespace-nowrap text-caption", i === current ? "font-medium text-ink" : "text-ink-muted")}>{step}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
