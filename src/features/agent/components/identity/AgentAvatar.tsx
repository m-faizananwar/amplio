"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/shell/theme/useTheme";
import { AgentMark } from "@/components/brand/AgentMark";
import { AGENT_ACCENT } from "./agent-colors";

// bot-avatars draws on a 2D canvas: loaded on demand, only in the signed-in shell
const BotAvatar = dynamic(() => import("bot-avatars").then((m) => m.BotAvatar), { ssr: false, loading: () => <AgentMark aria-hidden="true" className="size-4 text-money" /> });

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

type Props = { size: number; state?: "default" | "working"; interactive?: boolean; className?: string };

// Agentic mode's identity: a small glossy bot in the accent blue that idles
// (turns, blinks) and hops while it's working or speaking. Frozen on its first
// frame under reduced motion; the breathing mark stands in until it has loaded.
export function AgentAvatar({ size, state = "default", interactive = false, className }: Props) {
  const { resolved } = useTheme();
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(reducedQuery).matches, () => true);
  return (
    <span className={className} style={{ display: "inline-grid", placeItems: "center", width: size, height: size }} aria-hidden="true">
      <BotAvatar type="clover" size={size} state={state} color={AGENT_ACCENT[resolved]} theme={resolved} interactive={interactive} paused={reduced} />
    </span>
  );
}
