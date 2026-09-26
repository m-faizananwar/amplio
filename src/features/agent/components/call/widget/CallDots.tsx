"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { CallMode } from "../callTypes";

type Props = { mode: CallMode; readInput: () => number; readOutput: () => number; className?: string };

const EASE = 0.25;
const THINK_MS = 180;
// at most 1.6× and a lift of 1.2 viewBox units: the mark stays the mark
const MAX_GROW = 0.6;
const RISE = 1.2;
const EDGE = 0.8;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// The mark's three dots as the call's pulse: equal circles on their line that
// swell a little and lift with the level (the mic while listening, the voice
// while speaking); thinking, a small wave runs across them; muted or at rest
// they sit still. Transform only; reduced motion keeps them still.
export function CallDots({ mode, readInput, readOutput, className }: Props) {
  const root = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let level = 0;
    const paint = (now: number) => {
      const dots = root.current?.querySelectorAll<SVGCircleElement>("circle");
      const target = clamp01(mode === "listening" ? readInput() : mode === "speaking" ? readOutput() : 0);
      level += (target - level) * EASE;
      dots?.forEach((dot, i) => {
        const wave = mode === "thinking" ? 0.5 * Math.max(0, Math.sin(now / THINK_MS - i * 0.9)) : 0;
        const amount = clamp01(level * (i === 1 ? 1 : EDGE) + wave);
        dot.style.transform = still ? "" : `translate(0px, ${(-RISE * amount).toFixed(2)}px) scale(${(1 + MAX_GROW * amount).toFixed(3)})`;
      });
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [mode, readInput, readOutput]);
  return (
    <svg ref={root} viewBox="0 0 28 12" data-mode={mode} className={cn("call-dots overflow-visible text-ink", className)} aria-hidden="true">
      <path d="M3 9 L14 4 L25 7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      <circle cx="3" cy="9" r="2.4" fill="currentColor" />
      <circle cx="14" cy="4" r="2.4" fill="currentColor" />
      <circle cx="25" cy="7" r="2.4" fill="currentColor" />
    </svg>
  );
}
