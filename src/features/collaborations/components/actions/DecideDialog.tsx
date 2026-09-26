"use client";

import { Check, Handshake } from "lucide-react";
import { useState } from "react";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import type { Fact } from "@/components/dialog/DialogFacts";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ActionPanel } from "./ActionPanel";

type Labels = { title: string; description: string; open: string; accept: string; decline: string; declineArmed: string; warning: string; cancel: string };
type Props = { labels: Labels; facts: Fact[]; disabled: boolean; onDecide: (decision: "accept" | "decline") => Promise<boolean> };

// Accept or decline, for either side: the panel says it's your call, the
// dialog shows the terms it rests on. Accept is one click; declining closes
// the collaboration for good, so it arms first and says what it costs.
export function DecidePanel({ labels: l, facts, disabled, onDecide }: Props) {
  const [open, setOpen] = useState(false);
  const decide = async (decision: "accept" | "decline") => { if (await onDecide(decision)) setOpen(false); };
  return (
    <ActionPanel title={l.title} description={l.description}>
      <Button type="button" icon={<Handshake />} disabled={disabled} onClick={() => setOpen(true)}>{l.open}</Button>
      <ActionDialog
        open={open}
        onOpenChange={setOpen}
        icon={<Handshake />}
        tone="attention"
        title={l.title}
        sub={l.description}
        facts={facts}
        action={
          <>
            <ConfirmButton disabled={disabled} confirmLabel={l.declineArmed} onConfirm={() => decide("decline")}>{l.decline}</ConfirmButton>
            <Button type="button" icon={<Check />} disabled={disabled} onClick={() => decide("accept")}>{l.accept}</Button>
          </>
        }
        cancelLabel={l.cancel}
      >
        <p className="text-caption text-ink-muted">{l.warning}</p>
      </ActionDialog>
    </ActionPanel>
  );
}
