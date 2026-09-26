"use client";

import { useFormatter } from "next-intl";
import { useState } from "react";
import { TrailDrawer } from "@/components/trail/TrailDrawer";
import type { TrailRow } from "@/components/trail/types";
import { StatCard } from "@/components/ui/stat-card";

export type CreatorNumber = { key: string; label: string; hint: string; value: number; money?: boolean; rows: TrailRow[]; drawerTitle: string; spark?: { points: number[]; labels: string[] } };
type Labels = { region: string; open: string; empty: string };

// Three numbers under Needs you. Each is a receipt: it opens the rows it is made of.
export function CreatorNumbers({ numbers, labels }: { numbers: CreatorNumber[]; labels: Labels }) {
  const format = useFormatter();
  const [open, setOpen] = useState<string | null>(null);
  const money = (cents: number) => format.number(cents / 100, { style: "currency", currency: "EUR" });
  const time = (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const active = numbers.find((n) => n.key === open);
  return (
    <section aria-label={labels.region} className="grid gap-4 sm:grid-cols-3">
      {numbers.map((n) => (
        <StatCard
          key={n.key}
          label={n.label}
          hint={n.hint}
          value={n.value}
          tone={n.money ? "money" : "ink"}
          spark={n.spark?.points}
          sparkLabels={n.spark?.labels}
          format={n.money ? money : (v) => format.number(v)}
          onOpen={() => setOpen(n.key)}
          openLabel={labels.open}
        />
      ))}
      <TrailDrawer
        open={active !== undefined}
        onOpenChange={(next) => !next && setOpen(null)}
        title={active?.drawerTitle ?? ""}
        total={active ? (active.money ? money(active.value) : format.number(active.value)) : ""}
        rows={active?.rows ?? []}
        emptyText={labels.empty}
        formatAmount={money}
        formatTime={time}
      />
    </section>
  );
}
