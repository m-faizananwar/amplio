"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { PersonAvatar } from "@/components/ui/avatar";
import { buttonVariants, Button } from "@/components/ui/button";
import { toggleShortlist } from "@/features/marketplace/server/actions";
import type { CreatorCard } from "../events";

const CENTS = 100;

// One creator the agent found: who, reach, price, and the fit that opens to
// its reason. Shortlist is the real shortlist (optimistic, rolls back);
// in a sample run it only toggles here.
export function CreatorResultCard({ creator: c, sample }: { creator: CreatorCard; sample: boolean }) {
  const t = useTranslations("agent.result");
  const format = useFormatter();
  const [saved, setSaved] = useState(false);
  const [why, setWhy] = useState(false);
  async function toggle() {
    const next = !saved;
    setSaved(next);
    if (sample) return;
    const res = await toggleShortlist({ creatorId: c.id, shortlisted: next });
    if (!res.ok) setSaved(!next);
  }
  return (
    <article className="agent-rise grid w-64 shrink-0 snap-start content-start gap-3 rounded-card border border-rule bg-surface p-4 shadow-lift">
      <div className="flex items-center gap-3">
        <PersonAvatar name={c.name} src={c.avatarUrl ?? undefined} />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{c.name}</p>
          <p className="truncate text-small text-ink-muted">{c.headline}</p>
        </div>
      </div>
      <p className="num text-small text-ink-muted">
        {format.number(c.followers, { notation: "compact" })} {t("followers")} · <span className="text-ink">{format.number(c.priceCents / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</span> {t("perPost")}
      </p>
      {c.fitScore !== undefined ? (
        <div className="grid gap-1.5">
          <button type="button" onClick={() => setWhy((v) => !v)} aria-expanded={why} disabled={!c.fitReason} className="num inline-flex w-fit items-center rounded-chip border border-ink px-2 py-0.5 text-caption font-medium outline-none focus-visible:ring-2 focus-visible:ring-money">
            {t("fit", { score: c.fitScore })}
          </button>
          {why && c.fitReason ? <p className="text-small text-ink-muted"><span className="sr-only">{t("whyFit")}: </span>{c.fitReason}</p> : null}
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Button type="button" variant="quiet" size="sm" aria-pressed={saved} onClick={toggle} icon={saved ? <BookmarkCheck /> : <Bookmark />}>{saved ? t("shortlisted") : t("shortlist")}</Button>
        <Link href={`/brand/creators?q=${encodeURIComponent(c.name)}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>{t("open")}</Link>
      </div>
    </article>
  );
}
