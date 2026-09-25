"use client";

import { useEffect, useRef, useState } from "react";
import { Burst } from "@/components/graphics/Burst";

const STORE = "needs-you:marks";

function compareAndStore(signature: string): boolean {
  try {
    const before: string[] = JSON.parse(sessionStorage.getItem(STORE) ?? "[]");
    const now = signature ? signature.split("|") : [];
    sessionStorage.setItem(STORE, JSON.stringify(now));
    return before.some((m) => !now.includes(m));
  } catch {
    // storage blocked or malformed: no burst, nothing else changes
    return false;
  }
}

// Remembers what was waiting on the creator last visit (id + state); if any
// of it has moved on since, a burst plays where the list starts. The list
// itself closes up because the cleared row is simply gone.
export function ClearedBurst({ marks }: { marks: string[] }) {
  const [play, setPlay] = useState(0);
  const signature = marks.join("|");
  // the comparison runs once per signature: Strict Mode's second effect run
  // would otherwise compare against what the first run just stored
  const judged = useRef<{ signature: string; cleared: boolean } | null>(null);
  useEffect(() => {
    if (judged.current?.signature !== signature) judged.current = { signature, cleared: compareAndStore(signature) };
    if (!judged.current.cleared) return;
    // after paint, so the burst lands on the list the creator is looking at
    const frame = requestAnimationFrame(() => setPlay((n) => n + 1));
    return () => cancelAnimationFrame(frame);
  }, [signature]);
  if (play === 0) return null;
  return <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-8"><Burst key={play} /></span>;
}
