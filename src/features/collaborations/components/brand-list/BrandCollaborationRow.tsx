"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { PersonAvatar } from "@/components/ui/avatar";
import { StatusChip, statusTone } from "@/components/ui/status-chip";
import { ownerFor } from "@/lib/next-step";
import type { CollaborationDto } from "../../schemas";

const CENTS = 100;

// One collaboration from the brand's side: the creator, the next step and
// whose move it is, when the post is due, the fee. The row opens it.
export function BrandCollaborationRow({ c }: { c: CollaborationDto }) {
  const t = useTranslations("collaboration");
  const tb = useTranslations("brand.collaborations.table");
  const format = useFormatter();
  const money = format.number(c.feeCents / CENTS, { style: "currency", currency: "EUR" });
  const owner = ownerFor(c.status, "brand");
  const vars = { creator: c.creatorName, brand: c.brandCompany, round: c.revisionRound, max: c.maxRevisionRounds, amount: money };
  return (
    <li>
      <Link href={`/brand/collaborations/${c.id}`} className="grid gap-2 px-5 py-4 outline-none transition-colors duration-(--duration-fast) ease-ledger hover:bg-tint focus-visible:bg-tint md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.7fr)_7rem_7rem] md:items-center md:gap-4">
        <span className="flex min-w-0 items-center gap-3">
          <PersonAvatar name={c.creatorName} src={c.creatorAvatarUrl} size="sm" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{c.creatorName}</span>
            <span className="block truncate text-small text-ink-muted">{c.campaignName}</span>
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          {owner === "you" ? <span aria-hidden="true" className="size-2 shrink-0 rounded-chip bg-attention" /> : null}
          <span className="min-w-0">
            <span className={`block truncate text-body ${owner === "you" ? "font-medium text-ink" : "text-ink-muted"}`}>{t(`nextAction.brand.${c.status}.action`, vars)}</span>
            <span className="flex items-center gap-2 text-caption text-ink-muted">
              <StatusChip tone={statusTone(c.status)}>{t(`status.${c.status}`)}</StatusChip>
              {t(`nextAction.brand.${c.status}.owner`, vars)}
            </span>
          </span>
        </span>
        <span className="flex justify-between gap-3 md:contents">
          <span className="num text-small text-ink-muted">{c.dueDate ? format.dateTime(new Date(c.dueDate), { day: "numeric", month: "short" }) : tb("noDue")}</span>
          <span className={`num text-small md:text-right ${c.status === "paid" ? "text-money" : "text-ink"}`}>{money}</span>
        </span>
      </Link>
    </li>
  );
}
