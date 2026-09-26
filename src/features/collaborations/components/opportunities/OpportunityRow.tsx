"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BrandMark } from "@/components/graphics/BrandMark";
import type { OpportunityDto } from "../../schemas";
import { FitRing } from "@/components/graphics/FitRing";
import { listRowStyle } from "@/components/motion/useListTransition";
import { StatusGlyph } from "@/components/graphics/StatusGlyph";
import { FitBreakdown } from "./FitBreakdown";
import { OpportunityActions } from "./OpportunityActions";

type Props = { opportunity: OpportunityDto; pending: boolean; onApply: (o: OpportunityDto) => void; onBrief: (o: OpportunityDto) => void };

// One open campaign as a ledger row: who, what, how well it fits (opens the
// four signals in place), where an existing collaboration stands, and when.
export function OpportunityRow({ opportunity: o, pending, onApply, onBrief }: Props) {
  const t = useTranslations("creator.opportunities.item");
  const ts = useTranslations("collaboration.status");
  const [open, setOpen] = useState(false);
  const due = o.daysToDeadline === null ? t("noDeadline") : t("daysLeft", { count: Math.max(0, o.daysToDeadline) });
  return (
    <li className="vt-row grid gap-3 bg-surface px-5 py-4" style={listRowStyle(o.campaignId)}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_6rem_auto_11rem] md:items-center md:gap-x-4">
        <div className="flex min-w-0 items-start gap-3">
          <BrandMark name={o.brandCompany} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{o.campaignName}</p>
            <p className="truncate text-small text-ink-muted">{o.brandCompany} · {t("channel")} · <span className="num">{due}</span></p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 rounded-chip border border-rule px-2 py-0.5 text-caption text-ink hover:bg-tint">
                <FitRing score={o.matchScore} className="size-3.5 text-money" />
                <span className="num">{t("fitScore", { percent: o.matchScore })}</span> · {t("whyFit")}
                <ChevronDown className={`size-3 transition-transform duration-(--duration-fast) ${open ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {o.existingStatus ? (
                <span className="inline-flex items-center gap-1 text-caption text-ink-muted"><StatusGlyph status={o.existingStatus} className="size-3.5" />{ts(o.existingStatus)}</span>
              ) : null}
            </div>
          </div>
        </div>
        <OpportunityActions opportunity={o} pending={pending} onApply={onApply} onBrief={onBrief} />
      </div>
      {open ? <FitBreakdown signals={o.fitSignals} /> : null}
    </li>
  );
}
