"use client";

import { lazy, type ReactNode, Suspense } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useTheme } from "@/components/shell/theme/useTheme";

// border-beam is loaded only once a call is on screen
const BorderBeam = lazy(() => import("border-beam").then((m) => ({ default: m.BorderBeam })));

// on a white window the preset glow nearly vanishes
const LIGHT = { brightness: 1.9, saturation: 1.6, strength: 1 };

type Props = { working: boolean; radius: number; className?: string; children: ReactNode };

// A beam that rides the call window's border while the agent is working
// (tool steps running) and stops when it's idle or listening. Until the
// library arrives, the content renders in a plain frame.
export function CallBeam({ working, radius, className, children }: Props) {
  const { resolved } = useTheme();
  // the library stills the spin itself; the hue drift is ours to stop
  const reduced = useReducedMotion();
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <BorderBeam active={working} size="md" colorVariant="ocean" theme={resolved} borderRadius={radius} className={className} staticColors={reduced} {...(resolved === "light" ? LIGHT : null)}>
        {children}
      </BorderBeam>
    </Suspense>
  );
}
