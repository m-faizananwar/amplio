"use client";

import type { ReactNode } from "react";
import { CallContext } from "./callContext";
import { useAgentCall } from "./useAgentCall";
import { CallWidget } from "./widget/CallWidget";

// In the app shell, around everything, so the call and its widget outlive
// every route change.
export function AgentCallProvider({ role, csrfToken, children }: { role: "brand" | "creator"; csrfToken: string; children: ReactNode }) {
  const call = useAgentCall(role, csrfToken);
  return (
    <CallContext value={call}>
      {children}
      <CallWidget call={call} />
    </CallContext>
  );
}
