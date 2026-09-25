"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export type GeneratedWith = "ai" | "template";

export function isGeneratedWith(value: string | undefined): value is GeneratedWith {
  return value === "ai" || value === "template";
}

// Says how the draft brief was written — by the AI provider, or from the
// template when none is configured — and that all of it is editable.
export function GeneratedWithBanner({ generatedWith }: { generatedWith: GeneratedWith }) {
  const t = useTranslations("brand.campaigns.launch.generated");
  return (
    <p className="flex items-start gap-2 rounded-control border border-rule bg-tint px-4 py-3 text-small">
      <Sparkles className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
      <span>{t(generatedWith)}</span>
    </p>
  );
}
