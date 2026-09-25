"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { MonthPoint } from "../../server/queries";

const CENTS = 100;
const FULL = 100;
// the smallest earning month still reads as a bar, not a stub
const MIN_BAR_PERCENT = 4;

// Net earnings per month as bars on one baseline; the tallest month sets the
// scale and every bar is proportional to its amount.
export function EarningsChart({ months }: { months: MonthPoint[] }) {
  const t = useTranslations("creator.earnings.chart");
  const format = useFormatter();
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const max = Math.max(1, ...months.map((m) => m.cents));
  const empty = months.every((m) => m.cents === 0);
  return (
    <section className="rounded-card border border-rule bg-surface p-5">
      <h2 className="text-h4">{t("title")}</h2>
      <p className="text-small text-ink-muted">{t("description", { count: months.length })}</p>
      {empty ? <p className="mt-6 text-small text-ink-muted">{t("empty")}</p> : (
        <ol className="mt-6 grid grid-cols-6 items-end gap-2 sm:gap-4">
          {months.map((m, i) => (
            <li key={m.month} className="grid gap-2 text-center">
              <span className="num text-caption text-ink-muted">{m.cents > 0 ? money(m.cents) : "—"}</span>
              {/* no track behind the bars: a month is a bar only if it earned; an
                  empty month is a 2px stub on the baseline, never a grey column */}
              <span className="flex h-32 items-end border-b border-rule">
                {m.cents > 0 ? (
                  <span className="block w-full origin-bottom rounded-t-control bg-ink animate-rise" style={{ height: `${Math.max(MIN_BAR_PERCENT, Math.round((m.cents / max) * FULL))}%`, animationDelay: `${i * 40}ms` }} />
                ) : (
                  <span aria-hidden="true" className="block h-0.5 w-full bg-rule" />
                )}
              </span>
              <span className="text-caption text-ink">{format.dateTime(new Date(`${m.month}-01T00:00:00Z`), { month: "short" })}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
