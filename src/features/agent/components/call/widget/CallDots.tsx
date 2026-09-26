"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { CallMode } from "../callTypes";

type Props = { mode: CallMode; readInput: () => number; readOutput: () => number; className?: string };

const EASE = 0.35;
const THINK_MS = 180;
const THINK_LIFT = 0.45;
const GAIN = 1.5;
const EDGE_DAMP = 0.35;

// The mark's three dots as the call's pulse: listening, they follow the mic;
// speaking, the agent's voice; thinking, a wave runs across them; muted or at
// rest, they sit still. Transform only; reduced motion keeps them still.
export function CallDots({ mode, readInput, readOutput, className }: Props) {
  const root = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let level = 0;
    const paint = (now: number) => {
      const dots = root.current?.querySelectorAll<SVGCircleElement>("circle");
      const target = mode === "listening" ? readInput() : mode === "speaking" ? readOutput() : 0;
      level += (target - level) * EASE;
      dots?.forEach((dot, i) => {
        const wave = mode === "thinking" ? THINK_LIFT * Math.max(0, Math.sin(now / THINK_MS - i * 0.9)) : 0;
        const voice = level * GAIN * (1 - Math.abs(i - 1) * EDGE_DAMP);
        dot.style.transform = still ? "" : `scale(${(1 + wave + voice).toFixed(3)})`;
      });
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [mode, readInput, readOutput]);
  return (
    <svg ref={root} viewBox="0 0 28 12" data-mode={mode} className={cn("call-dots text-ink", className)} aria-hidden="true">
      <path d="M3 9 L14 4 L25 7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      <circle cx="3" cy="9" r="2.4" fill="currentColor" />
      <circle cx="14" cy="4" r="2.4" fill="currentColor" />
      <circle cx="25" cy="7" r="2.4" fill="currentColor" />
    </svg>
  );
}
