"use client";

import { useFormatter, useTranslations } from "next-intl";
import { PersonAvatar } from "@/components/ui/avatar";
import { useFitWords } from "@/features/marketplace/components/ledger/useFitWords";
import type { CreatorPickDto } from "../../schemas";

type Props = { creator: CreatorPickDto; action?: React.ReactNode; leading?: React.ReactNode };

const CENTS = 100;

// One creator line, shared by the campaign shortlist and the launch picker:
// who, why they fit (the one-line reason), fit and price, and an action.
export function CreatorRow({ creator, action, leading }: Props) {
  const t = useTranslations("brand.campaigns.creatorRow");
  const format = useFormatter();
  const { reason } = useFitWords();
  return (
    <div className="flex items-center gap-3 py-3">
      {leading}
      <PersonAvatar name={creator.name} src={creator.avatarUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{creator.name}</p>
        <p className="truncate text-caption text-ink-muted">{creator.industries.join(" · ") || t("noIndustries")} · {creator.country}</p>
        <p className="mt-0.5 hidden truncate text-caption text-ink-muted sm:block">{reason(creator.signals)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="num text-small text-ink">{t("fit", { score: creator.fit })}</p>
        <p className="num text-caption text-ink-muted">{t("price", { price: format.number(creator.priceCents / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }) })}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
