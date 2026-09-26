"use client";

import { lazy, type ReactNode, Suspense } from "react";
import { useTheme } from "@/components/shell/theme/useTheme";
import type { CallMode } from "../callTypes";

// voice-glow is loaded only once a call is on screen
const VoiceBeam = lazy(() => import("voice-glow").then((m) => ({ default: m.VoiceBeam })));

type Props = { mode: CallMode; readInput: () => number; readOutput: () => number; type?: "default" | "pill"; className?: string; children: ReactNode };

// The call's voice, as a glow along the bottom edge of what it wraps: it
// follows the mic while listening and Vapi's output level while speaking,
// idles softly while thinking (voice-glow's processing loop), and rests when
// muted. The level is a getter, sampled per frame without re-rendering.
export function CallGlow({ mode, readInput, readOutput, type = "pill", className, children }: Props) {
  const { resolved } = useTheme();
  const level = () => (mode === "listening" ? readInput() : mode === "speaking" ? readOutput() : 0);
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <VoiceBeam type={type} level={level} processing={mode === "thinking"} active={mode !== "rest"} theme={resolved} colorVariant="ocean" className={className}>
        {children}
      </VoiceBeam>
    </Suspense>
  );
}
