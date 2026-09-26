"use client";

import { lazy, type ReactNode, Suspense } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useTheme } from "@/components/shell/theme/useTheme";

// border-beam arrives with the first beam on screen
const BorderBeam = lazy(() => import("border-beam").then((m) => ({ default: m.BorderBeam })));

// on a white page the preset glow nearly vanishes
const LIGHT = { brightness: 1.9, saturation: 1.6, strength: 1 };

type Props = { active: boolean; radius: number; size?: "sm" | "md" | "line"; className?: string; children: ReactNode };

// A beam riding a border while something is live on this page: the composer
// during a run, the step that is running, a card waiting for the user. Off,
// it's a plain frame; until the library loads, the content renders as is.
export function AgentBeam({ active, radius, size = "md", className, children }: Props) {
  const { resolved } = useTheme();
  const reduced = useReducedMotion();
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <BorderBeam active={active} size={size} colorVariant="ocean" theme={resolved} borderRadius={radius} className={className} staticColors={reduced} {...(resolved === "light" ? LIGHT : null)}>
        {children}
      </BorderBeam>
    </Suspense>
  );
}
