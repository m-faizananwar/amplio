"use client";

import { useRef } from "react";
import { RollingNumber } from "@/components/ui/rolling-number";
import { useInView } from "../useInView";

type Props = { signups: number; label: string; liveLabel: string; compact?: boolean };

// Scene 4: sign-ups land on the brand's site. A click travels into the page's
// sign-up form and turns green; the count is the demo workspace's real one.
export function SignupsVisual({ signups, label, liveLabel, compact = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.4, repeat: true });
  return (
    <div ref={ref} className="mx-auto w-full max-w-lg">
      {compact ? null : <div className="relative rounded-card border border-rule bg-surface shadow-float">
        <div className="flex gap-1.5 border-b border-rule px-4 py-3" aria-hidden="true">
          {[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-ink/15" />)}
        </div>
        <div className="space-y-3 p-6" aria-hidden="true">
          <span className="cut block h-3 w-1/2 rounded-full bg-ink/15" />
          <span className="cut block h-9 rounded-control border border-rule" style={{ ["--d" as string]: "80ms" }} />
          <span className="cut flex h-9 items-center justify-center rounded-control bg-ink text-small text-paper" style={{ ["--d" as string]: "160ms" }}>
            Sign up
          </span>
        </div>
        <span className="stamp absolute -right-3 -top-3 flex size-10 items-center justify-center rounded-full bg-money text-paper" style={{ ["--d" as string]: "420ms" }} aria-hidden="true">
          ✓
        </span>
      </div>}
      <p className="mt-8 text-[clamp(72px,12vw,120px)] font-semibold leading-none tracking-[-0.04em] text-money">
        <RollingNumber value={on ? signups : 0} />
      </p>
      <p className="mt-2 text-lead text-ink-muted">
        {label} <span className="text-caption">· {liveLabel}</span>
      </p>
    </div>
  );
}
