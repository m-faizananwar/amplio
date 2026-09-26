"use client";

import { useCall } from "../call/callContext";
import { AgentAvatar } from "./AgentAvatar";

// The sidebar's Agentic mode icon: the bot, 20px in the 28px square; it
// works (hops) while a call is live.
export function AgentNavIcon() {
  const call = useCall();
  const live = call?.status === "live" || call?.status === "connecting";
  return <AgentAvatar size={20} state={live ? "working" : "default"} />;
}
