"use client";

import { useTranslations } from "next-intl";
import type { CollaborationDto } from "../../schemas";
import { useDetailFormat } from "./useDetailFormat";

// For the creator: where their fee is right now — held, awaiting release,
// paid, or returned. The money is real before anyone writes a word.
export function MoneyNote({ collaboration: c }: { collaboration: CollaborationDto }) {
  const t = useTranslations("collaboration.detail.creator.money");
  const fmt = useDetailFormat();
  const v = { brand: c.brandCompany, amount: fmt.money(c.feeCents), date: c.paidAt ? fmt.date(c.paidAt) : "" };
  const state = c.status === "paid" ? "paid" : c.status === "declined" ? "returned" : c.status === "live" ? "awaitingRelease" : c.status === "applied" ? null : "held";
  if (!state) return null;
  return (
    <section className="rounded-card border border-rule bg-surface p-5">
      <h2 className="text-small font-medium text-ink-muted">{t("title")}</h2>
      <p className={`num mt-1 text-h3 ${state === "returned" ? "text-ink-muted line-through" : "text-money"}`}>{v.amount}</p>
      <p className="mt-1 text-small"><span className="font-medium text-ink">{t(state)}</span> <span className="text-ink-muted">· {t(`${state}Note`, v)}</span></p>
    </section>
  );
}
