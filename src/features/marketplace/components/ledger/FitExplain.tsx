"use client";

import type { FitResult } from "@/lib/fit-score";
import { useFitWords } from "./useFitWords";

const PERCENT = 100;

// The four signals behind a fit score and the one-line reason, worded from
// each signal's facts in the reader's language. Opened in place, under the row.
export function FitExplain({ fit, campaignName }: { fit: FitResult; campaignName: string | null }) {
  const { t, detail, reason: reasonOf } = useFitWords();
  const reason = reasonOf(fit.signals);
  return (
    <div className="grid gap-3 rounded-control border border-rule bg-paper p-4 animate-rise">
      <p className="text-caption text-ink-muted">{campaignName ? t("against", { campaign: campaignName }) : t("noCampaign")}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {fit.signals.map((s, i) => (
          <li key={s.key} className="grid gap-1">
            <span className="flex items-baseline justify-between gap-3 text-small">
              <span className="text-ink">{t(`signals.${s.key}`)} <span className="text-caption text-ink-muted">· {t("weight", { percent: Math.round(s.weight * PERCENT) })}</span></span>
              <span className="num text-ink">{Math.round(s.score)}</span>
            </span>
            <span className="h-1 overflow-hidden rounded-chip bg-tint" aria-hidden="true">
              <span className="block h-full origin-left rounded-chip bg-ink animate-rise" style={{ width: `${Math.min(PERCENT, Math.max(0, s.score))}%`, animationDelay: `${i * 40}ms` }} />
            </span>
            <span className="text-caption text-ink-muted">{detail(s)}</span>
          </li>
        ))}
      </ul>
      <p className="border-t border-rule pt-3 text-small text-ink">{reason}</p>
    </div>
  );
}
