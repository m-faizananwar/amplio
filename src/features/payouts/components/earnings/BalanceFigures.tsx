"use client";

import { ChevronRight } from "lucide-react";
import { RollingNumber } from "@/components/ui/rolling-number";
import type { BalanceKey } from "./BalanceCard";

export type BalanceFigure = { key: BalanceKey; label: string; hint: string; value: number };

// The three figures under the available balance, ruled into one strip; each
// is a button that opens the ledger rows it adds up.
export function BalanceFigures({ figures, format, onOpen }: { figures: BalanceFigure[]; format: (cents: number) => string; onOpen: (key: BalanceKey) => void }) {
  return (
    <div className="grid divide-y divide-rule border-t border-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {figures.map((f) => (
        <button key={f.key} type="button" onClick={() => onOpen(f.key)} className="group/fig grid gap-0.5 px-5 py-4 text-left outline-none transition-colors duration-(--duration-fast) hover:bg-tint focus-visible:bg-tint">
          <span className="text-caption text-ink-muted">{f.label}</span>
          <span className="text-lead font-semibold text-ink"><RollingNumber value={f.value} format={format} /></span>
          <span className="flex items-center justify-between gap-2 text-caption text-ink-muted">
            <span className="truncate">{f.hint}</span>
            <ChevronRight className="size-3.5 shrink-0 transition-transform duration-(--duration-fast) group-hover/fig:translate-x-0.5" aria-hidden="true" />
          </span>
        </button>
      ))}
    </div>
  );
}
