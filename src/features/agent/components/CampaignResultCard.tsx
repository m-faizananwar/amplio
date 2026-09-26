"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { type ChipTone, StatusChip } from "@/components/ui/status-chip";
import type { ResultEvent } from "../events";

type CampaignResult = Extract<ResultEvent, { kind: "campaign" }>;

const CENTS = 100;
// draft waits on the brand to launch it; active is live money; the rest is done
const TONE: Record<string, ChipTone> = { draft: "attention", active: "money" };
const KNOWN = new Set(["draft", "active", "completed"]);

// the tool adds counts as the campaign moves on (invited and booked from a
// draft, posts, clicks and reach once live); only numbers that came are shown
function countOf(item: object, key: string): number | null {
  const v = (item as Record<string, unknown>)[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// One campaign as the agent found it: what it is, its name and state, then
// only the facts the tool returned (budget, post deadline, brief), and the
// way to open it.
export function CampaignResultCard({ result }: { result: CampaignResult }) {
  const t = useTranslations("agent.result.campaign");
  const format = useFormatter();
  const c = result.item;
  const euros = (cents: number) => format.number(cents / CENTS, { style: "currency", currency: "EUR" });
  const count = (key: string) => countOf(c, key);
  const committed = count("committedCents") ?? c.budgetCents ?? null;
  const facts = [
    count("creatorsInvited") !== null ? { label: t("invited"), value: format.number(count("creatorsInvited") as number), mono: true } : null,
    count("creatorsBooked") !== null ? { label: t("booked"), value: format.number(count("creatorsBooked") as number), mono: true } : null,
    count("publishedPosts") !== null ? { label: t("posts"), value: format.number(count("publishedPosts") as number), mono: true } : null,
    count("clicks") !== null ? { label: t("clicks"), value: format.number(count("clicks") as number), mono: true } : null,
    count("estReach") !== null ? { label: t("reach"), value: format.number(count("estReach") as number, { notation: "compact" }), mono: true } : null,
    committed !== null ? { label: t("budget"), value: euros(committed), mono: true } : null,
    c.postDeadline ? { label: t("deadline"), value: format.dateTime(new Date(c.postDeadline), { day: "numeric", month: "short", year: "numeric" }), mono: false } : null,
  ].filter((f): f is { label: string; value: string; mono: boolean } => f !== null);
  return (
    <section aria-label={c.name} className="agent-rise grid gap-3 rounded-card border border-rule bg-surface p-4 shadow-lift">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="grid min-w-0 gap-0.5">
          <p className="text-caption font-medium text-ink-muted">{t("kind")}</p>
          <p className="truncate text-h4 font-semibold">{c.name}</p>
        </div>
        <StatusChip tone={TONE[c.status] ?? "neutral"}>{KNOWN.has(c.status) ? t(`status.${c.status}`) : c.status}</StatusChip>
      </div>
      {facts.length ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {facts.map((f) => <div key={f.label} className="grid"><dt className="text-caption text-ink-muted">{f.label}</dt><dd className={f.mono ? "num font-medium" : "text-body"}>{f.value}</dd></div>)}
        </dl>
      ) : null}
      {c.brief ? <p className="line-clamp-3 text-small whitespace-pre-line text-ink-muted">{c.brief}</p> : null}
      <Link href={`/brand/campaigns/${encodeURIComponent(c.id)}`} className={buttonVariants({ variant: "quiet", size: "sm", className: "justify-self-start" })}>{t("open")}<ArrowRight aria-hidden="true" /></Link>
    </section>
  );
}
