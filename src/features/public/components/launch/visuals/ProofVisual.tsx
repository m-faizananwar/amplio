"use client";

import { useLocale } from "next-intl";
import { useRef } from "react";
import { formatCount, formatWholeEuros } from "@/lib/money";
import { RollingNumber } from "@/components/ui/rolling-number";
import { useInView } from "../useInView";

type Props = { billTitle: string; proofTitle: string; billLine: string; paidCents: number; clicksLine: string; signupsLine: string; clicks: number; signups: number; liveLabel: string };


// Scene 6: the bill and the proof, side by side — what the demo brand paid,
// and the clicks and sign-ups those posts brought. All three are real counts.
export function ProofVisual(p: Props) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.4, repeat: true });
  return (
    <div ref={ref} className="relative mx-auto grid w-full max-w-xl grid-cols-2 overflow-hidden rounded-card border border-paper/20">
      <svg className="pointer-events-none absolute left-[38%] top-1/2 z-10 h-6 w-[24%] -translate-y-1/2" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 12 H96" stroke="var(--scene-money)" strokeWidth="2" pathLength={1} className="st-draw" style={{ ["--d" as string]: "520ms" }} />
        {[4, 50, 96].map((x, i) => <circle key={x} cx={x} cy="12" r="4" fill="var(--scene-money)" className="st-pop" style={{ ["--d" as string]: `${560 + i * 120}ms` }} />)}
      </svg>
      <div className="st-in-l border-r border-paper/20 p-6 sm:p-8" style={{ ["--d" as string]: "80ms" }}>
        <p className="text-small opacity-70">{p.billTitle}</p>
        <p className="mt-4 text-[clamp(40px,5.5vw,64px)] font-semibold leading-none tracking-[-0.03em]">
          <RollingNumber value={on ? Math.round(p.paidCents / 100) : 0} format={(n) => formatWholeEuros(n * 100, locale)} />
        </p>
        <p className="mt-3 text-small opacity-70">{p.billLine}</p>
      </div>
      <div className="st-in-r p-6 sm:p-8" style={{ ["--d" as string]: "80ms" }}>
        <p className="text-small opacity-70">{p.proofTitle}</p>
        <p className="mt-4 text-[clamp(40px,5.5vw,64px)] font-semibold leading-none tracking-[-0.03em]">
          <RollingNumber value={on ? p.clicks : 0} format={(n) => formatCount(n, locale)} />
        </p>
        <p className="mt-1 text-small opacity-70">{p.clicksLine}</p>
        <p className="mt-4 text-[clamp(28px,4vw,40px)] font-semibold leading-none tracking-[-0.03em] text-[color:var(--scene-money)]">
          <RollingNumber value={on ? p.signups : 0} />
        </p>
        <p className="mt-1 text-small opacity-70">{p.signupsLine}</p>
      </div>
      <p className="col-span-2 border-t border-paper/20 px-6 py-2 text-caption opacity-60">{p.liveLabel}</p>
    </div>
  );
}
