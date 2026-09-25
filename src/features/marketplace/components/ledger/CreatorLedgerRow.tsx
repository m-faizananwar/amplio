"use client";

import { Bookmark, ChevronDown } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { PersonAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { CreatorDto } from "../../schemas";
import { useMarketplace } from "../useMarketplace";
import { FitExplain } from "./FitExplain";

const CENTS = 100;
const STRONG = 80;

// One creator as a ledger row: who, how well they fit (the score opens its
// four signals in place), reach, price, and the two things to do — keep them
// on a shortlist or invite them (a funded invitation; the fee is held).
export function CreatorLedgerRow({ creator: c }: { creator: CreatorDto }) {
  const t = useTranslations("brand.creators.row");
  const ts = useTranslations("collaboration.status");
  const format = useFormatter();
  const { ctx, openProfile, openBooking, collaborationStatus, isShortlisted, toggleShortlist } = useMarketplace();
  const [open, setOpen] = useState(false);
  const status = collaborationStatus(c);
  const saved = isShortlisted(c);
  const compact = (n: number) => format.number(n, { notation: "compact", maximumFractionDigits: 1 });
  return (
    <li className="grid gap-3 px-5 py-4">
      <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1.6fr)_6.5rem_5.5rem_5.5rem_5.5rem_auto] md:gap-4">
        <button type="button" onClick={() => openProfile(c)} className="flex min-w-0 items-center gap-3 rounded-control text-left outline-none focus-visible:ring-3 focus-visible:ring-ink/15">
          <PersonAvatar name={c.name} src={c.avatarUrl} />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink hover:underline">{c.name}</span>
            <span className="block truncate text-small text-ink-muted">{c.headline}</span>
            <span className="block truncate text-caption text-ink-muted">{c.industries.slice(0, 3).join(" · ")}</span>
          </span>
        </button>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn("inline-flex w-fit items-center gap-1 rounded-chip border px-2.5 py-1 text-caption outline-none transition-colors duration-(--duration-fast) hover:bg-tint focus-visible:ring-3 focus-visible:ring-ink/15", c.fit.score >= STRONG ? "border-ink text-ink" : "border-rule text-ink-muted")}>
          <span className="num font-medium">{t("fit", { score: c.fit.score })}</span>
          <ChevronDown className={cn("size-3 transition-transform duration-(--duration-fast) ease-ledger", open && "rotate-180")} aria-hidden="true" />
        </button>
        <Stat label={t("followers")} value={compact(c.followers)} />
        <Stat label={t("views")} value={compact(c.medianViews)} />
        <Stat label={t("price")} value={format.number(c.priceCents / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })} />
        <div className="flex items-center gap-2 md:justify-end">
          <Button type="button" variant="ghost" size="icon-sm" aria-pressed={saved} aria-label={saved ? t("unsave", { name: c.name }) : t("save", { name: c.name })} onClick={() => toggleShortlist(c)}>
            <Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden="true" />
          </Button>
          {status ? (
            <Button type="button" size="sm" variant="secondary" disabled>{ts(status)}</Button>
          ) : (
            <Button type="button" size="sm" disabled={!ctx.selectedCampaign} title={ctx.selectedCampaign ? undefined : t("needCampaign")} onClick={() => openBooking(c)}>{t("invite")}</Button>
          )}
        </div>
      </div>
      {open ? <FitExplain fit={c.fit} campaignName={ctx.selectedCampaign?.name ?? null} /> : null}
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline justify-between gap-2 md:block">
      <span className="text-caption text-ink-muted md:hidden">{label}</span>
      <span className="num text-small text-ink">{value}</span>
    </span>
  );
}
