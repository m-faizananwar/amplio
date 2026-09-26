"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { SECOND_MS } from "../callTypes";

const MINUTE_S = 60;
const pad = (n: number) => String(n).padStart(2, "0");

export function formatDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / SECOND_MS));
  return `${pad(Math.floor(s / MINUTE_S))}:${pad(s % MINUTE_S)}`;
}

// mm:ss since the call started, ticking once a second until it ends.
export function CallTimer({ startedAt, endedAt, className }: { startedAt: number | null; endedAt?: number | null; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt || endedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), SECOND_MS);
    return () => window.clearInterval(id);
  }, [startedAt, endedAt]);
  if (!startedAt) return null;
  return <span className={cn("num font-mono tabular-nums", className)}>{formatDuration((endedAt ?? now) - startedAt)}</span>;
}
