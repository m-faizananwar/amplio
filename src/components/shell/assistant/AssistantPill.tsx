"use client";

import { usePathname } from "next/navigation";
import { AssistantMount } from "@/features/assistant/components/AssistantMount";

type Props = { role: "brand" | "creator"; workspace: string; csrfToken: string };

// The app shells' floating assistant: a static shell at paint, the interactive
// widget (src/features/assistant) loaded on idle / approach and swapped in place.
// Not on the agent page, which is the same conversation full size.
export function AssistantPill({ role, csrfToken }: Props) {
  const pathname = usePathname();
  if (pathname.endsWith("/agent")) return null;
  return <AssistantMount mode={role} csrfToken={csrfToken} />;
}
