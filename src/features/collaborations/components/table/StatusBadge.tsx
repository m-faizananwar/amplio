"use client";

import { useEffect, useRef } from "react";

import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_TONES, type StatusTone } from "@/lib/collaboration-labels";
import type { CollaborationStatus } from "@/lib/collaboration-status";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-brand/10 text-brand",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  danger: "bg-destructive/10 text-destructive",
};
const POP_MS = 460;

// The chip keeps its element across a status change so the tone crossfades,
// and pops once when the status actually moves — never on first paint, which
// would set a whole table off at once.
export function StatusBadge({ status, className }: { status: CollaborationStatus; className?: string }) {
  const chip = useRef<HTMLSpanElement>(null);
  const seen = useRef(status);

  useEffect(() => {
    if (seen.current === status) return;
    seen.current = status;
    const el = chip.current;
    if (!el) return;
    el.classList.add("status-pop");
    const timer = window.setTimeout(() => el.classList.remove("status-pop"), POP_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <Badge ref={chip} variant="secondary" className={cn("status-chip", TONE_CLASSES[STATUS_TONES[status]], "border-transparent", className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
