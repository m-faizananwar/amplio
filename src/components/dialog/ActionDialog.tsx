"use client";

import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { DialogFacts, type Fact } from "./DialogFacts";
import { listenForTriggers, triggerOffset } from "./trigger-origin";

type Tone = "ink" | "money" | "attention" | "danger";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The glyph in the header disc. */
  icon: ReactNode;
  tone?: Tone;
  title: ReactNode;
  /** One line: what will happen if the person goes ahead. */
  sub: ReactNode;
  facts?: Fact[];
  /** Anything else the decision needs (a form, the draft). */
  children?: ReactNode;
  /** The primary action (a blob Button or a ConfirmButton for money / destructive moves). */
  action: ReactNode;
  cancelLabel: string;
  size?: "md" | "lg";
};

const DISC: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  money: "bg-money text-surface",
  attention: "bg-attention text-surface",
  danger: "bg-failure text-surface",
};

// Every decision dialog in one shape: an icon disc, a title and one line on
// what will happen; the facts it rests on; the action beside Cancel. The
// panel grows from the control that opened it (scale .96 → 1 on the spring,
// 300 ms); Esc and the backdrop close it, focus is trapped and returned, and
// the title and line label it (all from the Dialog primitive).
export function ActionDialog({ open, onOpenChange, icon, tone = "ink", title, sub, facts = [], children, action, cancelLabel, size = "md" }: Props) {
  useEffect(() => listenForTriggers(), []);
  // read once per opening, while the trigger is still where it was pressed
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOrigin(triggerOffset());
  }
  const style = { "--dlg-ox": `${origin?.x ?? 0}px`, "--dlg-oy": `${origin?.y ?? 0}px` } as CSSProperties;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={style} className={cn("action-dialog grid-cols-[minmax(0,1fr)] gap-0 overflow-hidden p-0", size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg")}>
        <div className="flex items-start gap-3.5 px-5 pt-5 pr-12">
          <span aria-hidden="true" className={cn("grid size-10 shrink-0 place-items-center rounded-full [&_svg]:size-5", DISC[tone])}>{icon}</span>
          <div className="grid gap-1">
            <DialogTitle className="text-lead font-semibold leading-snug text-ink">{title}</DialogTitle>
            <DialogDescription className="text-small text-ink-muted">{sub}</DialogDescription>
          </div>
        </div>
        <div className="grid max-h-[60vh] grid-cols-[minmax(0,1fr)] gap-4 overflow-y-auto px-5 py-5">
          <DialogFacts facts={facts} />
          {children}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-rule bg-paper px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Button type="button" variant="quiet" onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
          {action}
        </div>
      </DialogContent>
    </Dialog>
  );
}
