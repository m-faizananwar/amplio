"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { MonthPoint } from "../../server/queries";

const CENTS = 100;
const FULL = 100;
// the smallest earning month still reads as a bar, not a stub
const MIN_BAR_PERCENT = 4;
const BAR_STAGGER_MS = 40;

// Net earnings per month, inside the balance card: bars on one baseline, the
// tallest month sets the scale, an empty month is a 2px stub, never a column.
// Bars grow up from the baseline on the spring, and again when the figures change.
export function MonthBars({ months }: { months: MonthPoint[] }) {
  const t = useTranslations("creator.earnings.chart");
  const format = useFormatter();
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const max = Math.max(1, ...months.map((m) => m.cents));
  if (months.every((m) => m.cents === 0)) return <p className="text-small text-ink-muted">{t("empty")}</p>;
  return (
    <ol key={months.map((m) => m.cents).join(",")} aria-label={t("description", { count: months.length })} className="grid grid-cols-6 items-end gap-2 sm:gap-4">
      {months.map((m, i) => (
        <li key={m.month} className="grid gap-1.5 text-center">
          <span className="num text-caption text-ink-muted">{m.cents > 0 ? money(m.cents) : "—"}</span>
          <span className="flex h-16 items-end border-b border-rule">
            {m.cents > 0 ? (
              <span className="bar-grow block w-full rounded-t-control bg-ink" style={{ height: `${Math.max(MIN_BAR_PERCENT, Math.round((m.cents / max) * FULL))}%`, animationDelay: `${i * BAR_STAGGER_MS}ms` }} />
            ) : (
              <span aria-hidden="true" className="block h-0.5 w-full bg-rule" />
            )}
          </span>
          <span className="text-caption text-ink-muted">{format.dateTime(new Date(`${m.month}-01T00:00:00Z`), { month: "short" })}</span>
        </li>
      ))}
    </ol>
  );
}
