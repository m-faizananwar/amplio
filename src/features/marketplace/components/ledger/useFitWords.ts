"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/useOptionLabel";
import { type FitSignal, topSignals } from "@/lib/fit-score";

// Words for a fit signal and for the one-line reason, from the signal's facts,
// in the reader's language — shared by every place a fit score is explained.
export function useFitWords() {
  const t = useTranslations("brand.creators.fit");
  const format = useFormatter();
  const industryLabel = useOptionLabel("industries");
  const decimal = (v: string | number) => format.number(Number(v), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const detail = (s: FitSignal) => {
    const facts = { ...s.facts };
    if (s.key === "audience" && typeof facts.bucket === "string") facts.bucket = t(`buckets.${facts.bucket}`);
    // fit-score joins the matched industries with ", "; each is labelled on its own
    if (s.key === "category" && typeof facts.industries === "string") facts.industries = facts.industries.split(", ").map(industryLabel).join(", ");
    if (s.key === "engagement") {
      if (facts.rate !== undefined) facts.rate = decimal(facts.rate);
      if (facts.median !== undefined) facts.median = decimal(facts.median);
    }
    return t(`detail.${s.key}`, facts);
  };
  const reason = (signals: FitSignal[]) => {
    const [first, second] = topSignals(signals);
    if (!first) return "";
    if (!second) return detail(first);
    const next = detail(second);
    return t("reason", { first: detail(first), second: next.charAt(0).toLocaleLowerCase() + next.slice(1) });
  };
  return { t, detail, reason };
}
