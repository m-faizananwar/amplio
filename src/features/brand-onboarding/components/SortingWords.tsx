"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = { words: string[]; labels: { title: string; valueProp: string; idealCustomers: string; reading: string } };

const TICK_MS = 140;

// While the site is read: its words drop one by one into two trays — value
// proposition on the left, ideal customers on the right (DIRECTION.md,
// onboarding). The words are the site's own title and headings when we have
// them, a few neutral placeholders otherwise; they only show the idea.
export function SortingWords({ words, labels }: Props) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => (v >= words.length ? 0 : v + 1)), TICK_MS);
    return () => window.clearInterval(id);
  }, [words.length]);
  const left = words.filter((_, i) => i % 2 === 0 && i < n);
  const right = words.filter((_, i) => i % 2 === 1 && i < n);
  const tray = (title: string, items: string[]) => (
    <div className="min-h-32 rounded-card border border-rule bg-surface p-3">
      <p className="text-caption text-ink-muted">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((w, i) => <span key={`${w}-${i}`} className="animate-pop-in rounded-chip border border-rule bg-paper px-2 py-0.5 text-caption">{w}</span>)}
      </div>
    </div>
  );
  return (
    <div role="status" aria-live="polite" className="grid gap-4">
      <p className="flex items-center gap-2 text-small text-ink-muted">
        <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-money opacity-60 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-money" /></span>
        {labels.reading}
      </p>
      <p className={cn("text-h4")}>{labels.title}</p>
      <div className="grid gap-3 sm:grid-cols-2">{tray(labels.valueProp, left)}{tray(labels.idealCustomers, right)}</div>
    </div>
  );
}
