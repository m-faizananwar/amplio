"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { BrandMark } from "@/components/graphics/BrandMark";
import { StatusChip, statusTone } from "@/components/ui/status-chip";
import { ownerFor } from "@/lib/next-step";
import type { CollaborationDto } from "../../schemas";
import { StatusGlyph } from "@/components/graphics/StatusGlyph";

const CENTS = 100;

// One collaboration as a ledger row: who, the next step and whose it is,
// when it's due, what it pays. The whole row opens the collaboration.
export function CreatorCollaborationRow({ c }: { c: CollaborationDto }) {
  const t = useTranslations("collaboration");
  const tc = useTranslations("creator.collaborations.table");
  const format = useFormatter();
  const money = format.number(c.feeCents / CENTS, { style: "currency", currency: "EUR" });
  const owner = ownerFor(c.status, "creator");
  const vars = { brand: c.brandCompany, round: c.revisionRound, max: c.maxRevisionRounds, amount: money };
  return (
    <li>
      <Link href={`/creator/collaborations/${c.id}`} className="grid gap-2 px-5 py-4 transition-colors duration-(--duration-fast) ease-ledger hover:bg-tint focus-visible:bg-tint focus-visible:outline-none md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.6fr)_7rem_7rem] md:items-center md:gap-4">
        <span className="flex min-w-0 items-center gap-3">
          <BrandMark name={c.brandCompany} size="sm" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{c.brandCompany}</span>
            <span className="block truncate text-small text-ink-muted">{c.campaignName}</span>
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <StatusGlyph key={c.status} status={c.status} className={`size-4 ${owner === "you" ? "text-attention" : c.status === "live" || c.status === "paid" ? "text-money" : c.status === "declined" ? "text-failure" : "text-ink-muted"}`} />
          <span className="min-w-0">
            <span className={`block truncate text-body ${owner === "you" ? "font-medium text-ink" : "text-ink-muted"}`}>{t(`nextAction.creator.${c.status}.action`, vars)}</span>
            <span className="flex items-center gap-2 text-caption text-ink-muted">
              <StatusChip tone={statusTone(c.status)}>{t(`status.${c.status}`)}</StatusChip>
              {t(`nextAction.creator.${c.status}.owner`, vars)}
            </span>
          </span>
        </span>
        <span className="flex justify-between gap-3 md:contents">
          <span className="num text-small text-ink-muted">{c.dueDate ? format.dateTime(new Date(c.dueDate), { day: "numeric", month: "short" }) : tc("noDue")}</span>
          <span className={`num text-small md:text-right ${c.status === "paid" ? "text-money" : "text-ink"}`}>{money}</span>
        </span>
      </Link>
    </li>
  );
}
