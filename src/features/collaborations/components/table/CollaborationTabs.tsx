"use client";

import { cn } from "cn";

import { SlidingIndicator } from "@/components/motion/SlidingIndicator";

type Props<T extends string> = {
  tabs: readonly T[];
  labels: Record<T, string>;
  counts: Record<T, number>;
  value: T;
  onChange: (tab: T) => void;
};

// Underlined tab strip with a count pill per tab, like naano's tables.
export function CollaborationTabs<T extends string>({ tabs, labels, counts, value, onChange }: Props<T>) {
  return (
    // The underline is one element that slides between tabs; the buttons keep
    // their own colour change and count pill.
    <SlidingIndicator variant="underline" className="mb-4 overflow-x-auto border-b">
    <div role="tablist" aria-label="Filter collaborations" className="flex gap-1">
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              active ? "text-brand" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {labels[tab]}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                active ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {counts[tab]}
            </span>
          </button>
        );
      })}
    </div>
    </SlidingIndicator>
  );
}
