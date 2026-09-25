"use client";

import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/cn";
import { useInView } from "./useInView";
import { WordReveal } from "./WordReveal";

type Props = { kicker: string; title: string; body: string; visual: ReactNode; flip?: boolean; ink?: boolean };

// One idea per screen: a kicker, a big line landing word by word, one short
// sentence, and the visual that acts it out. `data-on` flips when the scene is
// half in view; visuals key their motion off it (quick cuts, no slow fades).
export function Scene({ kicker, title, body, visual, flip, ink }: Props) {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { amount: 0.45, repeat: true });
  return (
    <section ref={ref} data-on={on ? "" : undefined} className={cn("launch-scene", ink && "launch-scene--ink")}>
      <div className={cn("mx-auto grid min-h-[88svh] max-w-content items-center gap-10 px-4 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16", flip && "lg:[&>*:first-child]:order-2")}>
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
