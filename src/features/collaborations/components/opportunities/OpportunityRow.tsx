"use client";

import { ChevronDown } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PersonAvatar } from "@/components/ui/avatar";
import type { OpportunityDto } from "../../schemas";
import { FitBreakdown } from "./FitBreakdown";

type Props = { opportunity: OpportunityDto; pending: boolean; onApply: (o: OpportunityDto) => void; onBrief: (o: OpportunityDto) => void };

const CENTS = 100;

// One open campaign as a ledger row: who, what, how well it fits (opens the
// four signals in place), when, what it pays, and the two things to do.
export function OpportunityRow({ opportunity: o, pending, onApply, onBrief }: Props) {
  const t = useTranslations("creator.opportunities.item");
  const ts = useTranslations("creator.common.status");
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const due = o.daysToDeadline === null ? t("noDeadline") : t("daysLeft", { count: Math.max(0, o.daysToDeadline) });
  return (
    <li className="grid gap-3 px-5 py-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <PersonAvatar name={o.brandCompany} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{o.campaignName}</p>
            <p className="truncate text-small text-ink-muted">{o.brandCompany} · {t("channel")} · <span className="num">{due}</span></p>
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-1.5 inline-flex items-center gap-1 rounded-chip border border-rule px-2 py-0.5 text-caption text-ink hover:bg-tint">
              <span className="num">{t("fitScore", { percent: o.matchScore })}</span> · {t("whyFit")}
              <ChevronDown className={`size-3 transition-transform duration-(--duration-fast) ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="num mr-2 text-small text-money">{format.number(o.listPriceCents / CENTS, { style: "currency", currency: "EUR" })}</span>
          <Button type="button" variant="ghost" onClick={() => onBrief(o)}>{t("readBrief")}</Button>
          {o.existingCollaborationId ? (
            <Link href={`/creator/collaborations/${o.existingCollaborationId}`} className={buttonVariants({ variant: "secondary" })}>
              {o.existingStatus ? `${ts(o.existingStatus)} · ` : ""}{t("openCollaboration")}
            </Link>
          ) : (
            <Button type="button" onClick={() => onApply(o)} disabled={pending}>{pending ? t("applying") : t("apply")}</Button>
          )}
        </div>
      </div>
      {open ? <FitBreakdown signals={o.fitSignals} /> : null}
    </li>
  );
}
