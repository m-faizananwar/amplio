"use client";

import { usePathname } from "next/navigation";
import { useCall } from "../call/callContext";
import { AgentAvatar } from "./AgentAvatar";

// The sidebar's Agentic mode icon: the bot, 20px in the 28px square; it
// works (hops) while a call is live. On its own page the square is filled with
// the accent, so the bot switches to the square's ink instead of vanishing.
export function AgentNavIcon() {
  const call = useCall();
  const current = /\/(brand|creator)\/agent(\/|$)/.test(usePathname() ?? "");
  const live = call?.status === "live" || call?.status === "connecting";
  return <AgentAvatar size={20} state={live ? "working" : "default"} onAccent={current} />;
}
