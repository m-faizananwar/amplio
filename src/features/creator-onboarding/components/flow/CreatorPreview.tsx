"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Ref } from "react";
import { PreviewCard } from "@/components/flow/PreviewCard";
import { formatCount, formatWholeEuros } from "@/lib/money";
import { COUNTRIES } from "../../constants";
import { CreatorAvatar } from "./CreatorAvatar";
import type { CreatorCardData } from "./step-defaults";

type Slots = { headline?: Ref<HTMLParagraphElement>; country?: Ref<HTMLSpanElement>; industries?: Ref<HTMLDivElement> };
type Props = { data: CreatorCardData; showBack?: boolean; slots?: Slots };

const COMPLETE_PARTS = 6;
const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? "";

// The creator's card as brands will see it, on every onboarding step: photo,
// name, headline and industries on the front with followers, country and
// price below; the entered facts on the back. `slots` are where the card
// step's values fly in.
export function CreatorPreview({ data, showBack = false, slots }: Props) {
  const t = useTranslations("onboarding.preview");
  const locale = useLocale();
  const none = t("creator.none");
  const price = data.priceCents > 0 ? formatWholeEuros(data.priceCents, locale) : none;
  const done = [data.name, data.headline, data.country, data.industries.length, data.priceCents, data.legalName].filter(Boolean).length;
  const facts = [
    { label: t("creator.headline"), value: data.headline || none },
    { label: t("creator.country"), value: countryName(data.country) || none },
    { label: t("creator.industries"), value: data.industries.join(", ") || none },
    { label: t("creator.perPost"), value: price },
    { label: t("creator.bundles"), value: data.bundles ? String(data.bundles) : none },
    ...(data.legalName ? [{ label: t("creator.legalName"), value: data.legalName }] : []),
    ...(data.legalCountry ? [{ label: t("creator.legalCountry"), value: countryName(data.legalCountry) || data.legalCountry }] : []),
    ...(data.registeredBusiness === null ? [] : [{ label: t("creator.business"), value: data.registeredBusiness ? t("creator.yes") : t("creator.no") }]),
  ];
  return (
    <PreviewCard
      label={t("creator.label")}
      bandLabel={t("creator.band")}
      bandStart={<CreatorAvatar url={data.avatarUrl} />}
      name={data.name}
      namePlaceholder={t("creator.namePlaceholder")}
      progress={done / COMPLETE_PARTS}
      progressLabel={t("creator.progress")}
      stats={[
        { label: t("creator.followers"), value: data.followers > 0 ? formatCount(data.followers, locale) : none },
        { label: t("creator.country"), value: countryName(data.country) || none, ref: slots?.country },
        { label: t("creator.perPost"), value: price },
      ]}
      facts={facts}
      factsTitle={t("creator.facts")}
      showBack={showBack}
      flipLabels={{ toBack: t("flip.toBack"), toFront: t("flip.toFront") }}
    >
      <p ref={slots?.headline} className={data.headline ? "text-body" : "text-body text-ink-muted"}>{data.headline || t("creator.headlinePlaceholder")}</p>
      <div ref={slots?.industries} className="mt-3 flex min-h-7 flex-wrap gap-1.5">
        {data.industries.map((i) => <span key={i} className="rounded-chip border border-rule bg-surface px-2.5 py-0.5 text-caption">{i}</span>)}
      </div>
    </PreviewCard>
  );
}

