"use client";

import { usePathname } from "next/navigation";
import { useCall } from "@/features/agent/components/call/callContext";
import { AssistantMount } from "@/features/assistant/components/AssistantMount";

type Props = { role: "brand" | "creator"; workspace: string; csrfToken: string };

// The app shells' floating assistant: a static shell at paint, the interactive
// widget (src/features/assistant) loaded on idle / approach and swapped in place.
// Not on the agent page, which is the same conversation full size, and not
// while a call is on screen: one assistant at a time.
export function AssistantPill({ role, csrfToken }: Props) {
  const pathname = usePathname();
  const call = useCall();
  if (pathname.endsWith("/agent") || (call && call.status !== "idle" && !call.dismissed)) return null;
  return <AssistantMount mode={role} csrfToken={csrfToken} />;
}
