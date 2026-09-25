"use client";

import { useTranslations } from "next-intl";
import type { CollaborationDto } from "../../schemas";
import { useDetailFormat } from "./useDetailFormat";

function Term({ label, value, money, text }: { label: string; value: string; money?: boolean; text?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className={`${text ? "" : "num "}text-right text-small ${money ? "text-money" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

// The offer as it was made: fee, list price and discount, review rule, dates.
export function OfferTerms({ collaboration: c }: { collaboration: CollaborationDto }) {
  const t = useTranslations("collaboration.detail.terms");
  const fmt = useDetailFormat();
  const discounted = c.listPriceCents !== null && c.listPriceCents !== c.feeCents;
  return (
    <section className="rounded-card border border-rule bg-surface p-5">
      <h2 className="text-small font-medium text-ink-muted">{t("title")}</h2>
      <dl className="mt-2 divide-y divide-rule">
        <Term label={t("fee")} value={fmt.money(c.feeCents)} money />
        {discounted && c.listPriceCents !== null ? <Term label={t("listPrice")} value={t("discount", { amount: fmt.money(c.listPriceCents), percent: c.discountPercent })} /> : null}
        <Term text label={t("origin")} value={c.origin === "invitation" ? t("originInvitation") : t("originApplication")} />
        <Term text label={t("review")} value={c.approveBeforePublish ? t("reviewRequired") : t("reviewNotRequired")} />
        <Term label={t("dueDate")} value={c.dueDate ? fmt.date(c.dueDate) : t("noDeadline")} />
        {c.acceptBy && c.status === "invited" ? <Term label={t("answerBy")} value={fmt.dateTime(c.acceptBy)} /> : null}
        {c.scheduledAt ? <Term label={t("scheduledFor")} value={fmt.date(c.scheduledAt)} /> : null}
        {c.publishedAt ? <Term label={t("published")} value={fmt.date(c.publishedAt)} /> : null}
        {c.paidAt ? <Term label={t("paid")} value={fmt.date(c.paidAt)} /> : null}
      </dl>
      {c.offerNote ? (
        <blockquote className="mt-3 rounded-control bg-paper px-3 py-2 text-small">
          <span className="block text-caption text-ink-muted">{t("offerNote", { brand: c.brandCompany })}</span>
          {c.offerNote}
        </blockquote>
      ) : null}
    </section>
  );
}
