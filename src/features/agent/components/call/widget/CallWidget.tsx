"use client";

import { useSyncExternalStore } from "react";
import type { AgentCall } from "../useAgentCall";
import { CallSheet } from "./CallSheet";
import { CallWindow } from "./CallWindow";

const PHONE = "(max-width: 639px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

// Mounted once in the app shell, so route changes never drop the call.
// Nothing renders until a call starts, or after it's closed.
export function CallWidget({ call }: { call: AgentCall }) {
  const phone = useSyncExternalStore(subscribe, () => window.matchMedia(PHONE).matches, () => false);
  if (call.status === "idle" || call.dismissed) return null;
  return phone ? <CallSheet call={call} /> : <CallWindow call={call} />;
}
