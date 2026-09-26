"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { RollingNumber } from "@/components/ui/rolling-number";
import { StatusChip, statusTone } from "@/components/ui/status-chip";
import { COLLABORATION_STATUSES, type CollaborationStatus } from "@/lib/collaboration-status";
import type { ResultEvent } from "../events";
import { CampaignResultCard } from "./CampaignResultCard";
import { CreatorResultCard } from "./CreatorResultCard";

const CENTS = 100;
const isStatus = (s: string): s is CollaborationStatus => (COLLABORATION_STATUSES as readonly string[]).includes(s);
const CARD = "agent-rise rounded-card border border-rule bg-surface p-4 shadow-lift";

// A result as cards, never a wall of text: creators as a row to scroll,
// money as rolling figures, lists as compact rows with their next step.
export function ResultCard({ result, sample }: { result: ResultEvent; sample: boolean }) {
  const t = useTranslations("agent.result");
  const tc = useTranslations("collaboration");
  const format = useFormatter();
  const euros = (cents: number) => format.number(cents / CENTS, { style: "currency", currency: "EUR" });
  const title = <p className="text-small font-medium text-ink-muted">{result.title}</p>;
  // an empty list is said in the reply; a heading over nothing isn't a result
  if ("items" in result && result.items.length === 0) return null;
  switch (result.kind) {
    case "creators":
      return (
        <section className="grid gap-2">{title}
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">{result.items.map((c) => <CreatorResultCard key={c.id} creator={c} sample={sample} />)}</div>
        </section>
      );
    case "creator":
      return <section className="grid gap-2">{title}<CreatorResultCard creator={result.item} sample={sample} /></section>;
    case "brand":
      return (
        <section className={`${CARD} grid gap-2`}>{title}
          <p className="text-h4 font-semibold">{result.item.company}</p>
          <p className="text-caption text-ink-muted">{t("valueProp")}</p>
          <p className="text-body">{result.item.valueProp}</p>
          <p className="text-small text-ink-muted">{[...result.item.industries, ...result.item.regions].join(" · ")}</p>
        </section>
      );
    case "campaign":
      return <CampaignResultCard result={result} />;
    case "collaborations":
      return (
        <section className="grid gap-2">{title}
          <ul className="divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface shadow-lift">
            {result.items.map((c) => (
              <li key={c.id} className="agent-rise flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{c.counterpart}</p><p className="truncate text-small text-ink-muted">{c.campaign}</p></div>
                {c.nextAction === "needs_you" ? <span className="text-caption font-medium text-attention">{t("needsYou")}</span> : null}
                {isStatus(c.status) ? <StatusChip tone={statusTone(c.status)}>{tc(`status.${c.status}`)}</StatusChip> : null}
                <span className="num text-small">{euros(c.feeCents)}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    case "opportunities":
      return (
        <section className="grid gap-2">{title}
          <div className="grid gap-3 sm:grid-cols-2">
            {result.items.map((o) => (
              <article key={o.campaignId} className={`${CARD} grid gap-2`}>
                <p className="font-medium">{o.campaign}</p>
                <p className="text-small text-ink-muted">{o.brand} · <span className="num">{t("fit", { score: o.fitScore })}</span></p>
                <p className="num text-body">{euros(o.priceCents)}</p>
                <Link href="/creator/opportunities" className={buttonVariants({ size: "sm", className: "justify-self-start" })}>{t("apply")}</Link>
              </article>
            ))}
          </div>
        </section>
      );
    case "wallet":
    case "earnings": {
      const figures = result.kind === "wallet"
        ? [["available", result.item.availableCents], ["held", result.item.heldCents]] as const
        : [["earned", result.item.earnedCents], ["pending", result.item.awaitingCents], ["available", result.item.availableCents]] as const;
      return (
        <section className="grid gap-2">{title}
          <div className="grid gap-3 sm:grid-cols-3">
            {figures.map(([label, cents]) => (
              <div key={label} className={CARD}>
                <p className="text-small text-ink-muted">{t(label)}</p>
                <p className="mt-1 text-h3 font-semibold text-money"><RollingNumber value={cents} format={euros} /></p>
              </div>
            ))}
          </div>
        </section>
      );
    }
  }
}
