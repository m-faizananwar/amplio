"use client";

import { Coins } from "lucide-react";
import { useState } from "react";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import type { Fact } from "@/components/dialog/DialogFacts";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ActionPanel } from "./ActionPanel";

type Labels = { title: string; description: string; action: string; armed: string; cancel: string };

// Releasing the fee: the panel opens a dialog with who, which post, since
// when and how much. Money leaves the brand on this click and can't come
// back, so the release arms first and needs a second click, like a delete.
export function PayPanel({ labels: l, facts, disabled, onPay }: { labels: Labels; facts: Fact[]; disabled: boolean; onPay: () => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  return (
    <ActionPanel title={l.title} description={l.description}>
      <Button type="button" variant="money" icon={<Coins />} disabled={disabled} onClick={() => setOpen(true)}>{l.action}</Button>
      <ActionDialog open={open} onOpenChange={setOpen} icon={<Coins />} tone="money" title={l.title} sub={l.description} facts={facts} cancelLabel={l.cancel}
        action={<ConfirmButton variant="money" disabled={disabled} confirmLabel={l.armed} onConfirm={async () => { if (await onPay()) setOpen(false); }}>{l.action}</ConfirmButton>} />
    </ActionPanel>
  );
}
