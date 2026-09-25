"use client";

import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/cn";
import { useInView } from "./useInView";
import { WordReveal } from "./WordReveal";

type Props = { kicker: string; title: string; body: string; visual: ReactNode; flip?: boolean; ink?: boolean; index: number };

// One idea per screen: a kicker, a big line landing word by word, one short
// sentence, and the visual that acts it out. `data-on` flips when the scene is
// half in view; visuals key their motion off it (quick cuts, no slow fades).
export function Scene({ kicker, title, body, visual, flip, ink, index }: Props) {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { amount: 0.2, repeat: true });
  return (
    <section ref={ref} data-scene={index} data-on={on ? "" : undefined} className={cn("launch-scene", ink && "launch-scene--ink")}>
      <div className={cn("mx-auto grid max-w-content items-center gap-10 px-4 py-16 sm:px-8 lg:min-h-[72svh] lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:py-20", flip && "lg:[&>*:first-child]:order-2")}>
        <div>
          <p className="num text-small text-ink-muted launch-kicker">{kicker}</p>
          <WordReveal as="h2" text={title} className="mt-3 text-[clamp(40px,7vw,96px)] font-semibold leading-[0.95] tracking-[-0.04em]" />
          <p className="launch-body mt-6 max-w-md text-lead text-ink-muted">{body}</p>
        </div>
        <div className="launch-visual">{visual}</div>
      </div>
    </section>
  );
}
