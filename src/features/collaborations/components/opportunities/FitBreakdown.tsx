"use client";

import { useTranslations } from "next-intl";
import type { OpportunityDto } from "../../schemas";

const PERCENT = 100;

// The four signals behind a fit score, opened in place: what each measures,
// its weight, and how this creator scores on it. A number you can question.
export function FitBreakdown({ signals }: { signals: OpportunityDto["fitSignals"] }) {
  const t = useTranslations("creator.opportunities.fit");
  return (
    <div className="grid gap-3 rounded-control border border-rule bg-paper p-4">
      <div>
        <p className="text-small font-medium text-ink">{t("title")}</p>
        <p className="text-caption text-ink-muted">{t("description")}</p>
      </div>
      <ul className="grid gap-2.5">
        {signals.map((s, i) => (
          <li key={s.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="text-small text-ink">{t(`signals.${s.key}`)} <span className="text-caption text-ink-muted">· {t("weight", { percent: Math.round(s.weight * PERCENT) })}</span></span>
            <span className="num text-caption text-ink">{t("score", { percent: Math.round(s.score) })}</span>
            <span className="col-span-2 h-1 overflow-hidden rounded-chip bg-tint" aria-hidden="true">
              <span className="block h-full rounded-chip bg-ink animate-rise" style={{ width: `${Math.min(PERCENT, Math.max(0, s.score))}%`, animationDelay: `${i * 60}ms` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
