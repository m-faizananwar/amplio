"use client";

import { useRef } from "react";
import { RollingNumber } from "@/components/ui/rolling-number";
import { useInView } from "../useInView";

type Props = { billTitle: string; proofTitle: string; billLine: string; paidCents: number; clicksLine: string; signupsLine: string; clicks: number; signups: number; liveLabel: string };

const euros = (cents: number) => `€${Math.round(cents / 100).toLocaleString("en-US")}`;

// Scene 6: the bill and the proof, side by side — what the demo brand paid,
// and the clicks and sign-ups those posts brought. All three are real counts.
export function ProofVisual(p: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.4, repeat: true });
  return (
    <div ref={ref} className="mx-auto grid w-full max-w-lg grid-cols-2 overflow-hidden rounded-card border border-paper/20">
      <div className="cut border-r border-paper/20 p-6">
        <p className="text-small opacity-70">{p.billTitle}</p>
        <p className="mt-4 text-[clamp(36px,5vw,56px)] font-semibold leading-none tracking-[-0.03em]">
          <RollingNumber value={on ? Math.round(p.paidCents / 100) : 0} format={(n) => euros(n * 100)} />
        </p>
        <p className="mt-3 text-small opacity-70">{p.billLine}</p>
      </div>
      <div className="cut p-6" style={{ ["--d" as string]: "120ms" }}>
        <p className="text-small opacity-70">{p.proofTitle}</p>
        <p className="mt-4 text-[clamp(36px,5vw,56px)] font-semibold leading-none tracking-[-0.03em]">
          <RollingNumber value={on ? p.clicks : 0} />
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
