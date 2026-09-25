"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = { steps: string[]; current: number; label: string; stepOf: string; className?: string };

// Progress through a flow as a trail (DIRECTION.md, onboarding): dots joined
// by one line; done steps are ink, the current one is green and ringed, the
// line fills up to it. Sign-up is step 1; onboarding carries on the same rail.
export function StepRail({ steps, current, label, stepOf, className }: Props) {
  // arrive on the previous step, then fill to this one: the rail visibly moves
  const [shown, setShown] = useState(Math.max(0, current - 1));
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShown(current));
    return () => window.cancelAnimationFrame(id);
  }, [current]);
  const pct = steps.length > 1 ? (shown / (steps.length - 1)) * 100 : 0;
  return (
    <nav aria-label={label} className={cn("w-full", className)}>
      <p className="sr-only">{stepOf}</p>
      <ol className="relative flex justify-between">
        <span aria-hidden="true" className="absolute left-[7px] right-[7px] top-[7px] h-px bg-rule" />
        <span aria-hidden="true" className="absolute left-[7px] top-[7px] h-px w-[calc(100%-14px)] origin-left bg-ink transition-transform duration-500 ease-ledger motion-reduce:transition-none" style={{ transform: `scaleX(${pct / 100})` }} />
        {steps.map((step, i) => (
          <li key={step} aria-current={i === current ? "step" : undefined} className={cn("relative flex flex-col gap-2", i === 0 ? "items-start" : i === steps.length - 1 ? "items-end" : "items-center")} style={{ width: 14 }}>
            <span
              aria-hidden="true"
              className={cn(
                "size-3.5 rounded-full border-2 transition-[background-color,border-color,box-shadow] delay-300 duration-(--duration-base) motion-reduce:delay-0",
                i < shown && "border-ink bg-ink",
                i === shown && "border-money bg-money ring-4 ring-money-soft",
                i > shown && "border-rule-strong bg-paper",
              )}
            />
            <span className={cn("whitespace-nowrap text-caption", i === current ? "font-medium text-ink" : "text-ink-muted")}>{step}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
