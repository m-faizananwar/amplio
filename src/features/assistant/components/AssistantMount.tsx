"use client";

import { AssistantDock } from "./AssistantDock";

type Props = { mode: "public" | "brand" | "creator"; csrfToken?: string };

// The floating assistant on every surface. The dock is light (primitives and
// CSS only), so it renders straight away — no static shell to swap.
export function AssistantMount({ mode, csrfToken }: Props) {
  return <AssistantDock mode={mode} csrfToken={csrfToken} />;
}
