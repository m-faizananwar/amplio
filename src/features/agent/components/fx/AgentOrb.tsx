"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useTheme } from "@/components/shell/theme/useTheme";
import { cn } from "@/lib/cn";
import { AGENT_ACCENT } from "../identity/agent-colors";

// thinking-orbs draws on a canvas: loaded on demand, client only
const ThinkingOrb = dynamic(() => import("thinking-orbs").then((m) => m.ThinkingOrb), { ssr: false, loading: () => <span className="block size-full" /> });

type Props = { state?: "working" | "searching" | "breathing" | "composing"; size?: 20 | 32 | 64; className?: string };

// The agent at work, as a dotted orb in the accent: small beside a running
// step, larger while a turn has no step to show yet, largest on the empty
// page. Held on one frame under reduced motion. Decorative: the step's label
// and the busy state say it in words.
export function AgentOrb({ state = "working", size = 20, className }: Props) {
  const { resolved } = useTheme();
  const reduced = useReducedMotion();
  return (
    <span aria-hidden="true" className={cn("inline-grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <ThinkingOrb state={state} size={size} theme={resolved} color={AGENT_ACCENT[resolved]} paused={reduced} />
    </span>
  );
}
