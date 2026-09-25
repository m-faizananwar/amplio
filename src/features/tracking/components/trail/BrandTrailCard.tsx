"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { TrailDrawer } from "@/components/trail/TrailDrawer";
import type { TrailRow } from "@/components/trail/types";
import { StatCard } from "@/components/ui/stat-card";
import { loadBrandTrail } from "../../server/actions";
import type { BrandTrail, BrandTrailKind, BrandTrailRow } from "../../server/trail-queries";

const CENTS = 100;

type Props = {
  kind: BrandTrailKind;
  label: string;
  value: number;
  hint?: string;
  money?: boolean;
  exportHref?: string;
};

// A brand number that opens the rows it is made of. The rows load when the
// drawer opens, once per page view; the card itself renders from the page's data.
export function BrandTrailCard({ kind, label, value, hint, money, exportHref }: Props) {
  const t = useTranslations("brand.trail");
  const tc = useTranslations("common");
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const [trail, setTrail] = useState<BrandTrail | null>(null);
  const [failed, setFailed] = useState(false);
  const euros = (cents: number) => format.number(cents / CENTS, { style: "currency", currency: "EUR" });

  function show(next: boolean) {
    setOpen(next);
    if (!next || trail) return;
    setFailed(false);
    void loadBrandTrail(kind).then((r) => (r.ok ? setTrail(r.data) : setFailed(true)));
  }

  const toRow = (r: BrandTrailRow): TrailRow => ({
    id: r.id,
    at: r.at,
    title: r.creator ? `${r.creator} · ${r.campaign}` : r.description ?? t(`kind.${r.kind}`),
    detail: r.views !== undefined
      ? t("views", { views: format.number(r.views) })
      : r.creator
      ? [r.referrerHost ?? t("direct"), r.device ? t(`device.${r.device}`) : null, r.country].filter(Boolean).join(" · ")
      : undefined,
    source: r.pending ? t("kind.held") : t(`kind.${r.kind}`),
    amountCents: r.amountCents,
  });

  const total = trail
    ? t(trail.truncated ? "totalTruncated" : "total", { shown: trail.rows.length, count: trail.total })
    : money ? euros(value) : format.number(value);

  return (
    <>
      <StatCard label={label} value={value} format={money ? euros : undefined} tone={money ? "money" : "ink"} hint={hint} onOpen={() => show(true)} openLabel={tc("actions.showRows")} />
      <TrailDrawer
        open={open}
        onOpenChange={show}
        title={label}
        total={total}
        rows={trail?.rows.map(toRow) ?? []}
        loading={open && !trail && !failed}
        emptyText={failed ? tc("states.errorBody") : t(`empty.${kind}`)}
        exportHref={exportHref}
        exportLabel={tc("actions.exportCsv")}
        formatAmount={euros}
        formatTime={(iso) => format.dateTime(new Date(iso), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
      />
    </>
  );
}
