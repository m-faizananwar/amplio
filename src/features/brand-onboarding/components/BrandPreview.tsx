"use client";

import { useTranslations } from "next-intl";
import { PreviewCard } from "@/components/flow/PreviewCard";
import { Silhouette } from "@/components/Silhouette";

type Icp = { title: string; description: string };
type Props = { company: string; logoUrl: string | null; website: string; valueProp: string; icps: Icp[]; status: string; showBack: boolean };

const PARTS = 5; // website, value proposition, three ideal customers

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// The brand's profile as creators will see it in every brief: the company,
// its value proposition and its ideal customers, filling in as the draft is
// edited. The back lists the same facts row by row; it turns over when the
// draft lands.
export function BrandPreview({ company, logoUrl, website, valueProp, icps, status, showBack }: Props) {
  const t = useTranslations("onboarding.preview");
  const none = t("brand.none");
  const named = icps.filter((i) => i.title.trim());
  const done = [website, valueProp.trim()].filter(Boolean).length + named.length;
  return (
    <PreviewCard
      label={t("brand.label")}
      bandLabel={t("brand.band")}
      bandStart={<span className="block size-12 overflow-hidden rounded-2xl ring-2 ring-surface" aria-hidden="true">{logoUrl ? <img src={logoUrl} alt="" className="size-full object-cover" /> : <Silhouette kind="logo" />}</span>}
      name={company}
      namePlaceholder={t("brand.namePlaceholder")}
      progress={done / PARTS}
      progressLabel={t("brand.progress")}
      stats={[
        { label: t("brand.website"), value: website ? hostOf(website) : none },
        { label: t("brand.customers"), value: named.length || none },
        { label: t("brand.status"), value: status },
      ]}
      facts={[
        { label: t("brand.website"), value: website ? hostOf(website) : none },
        { label: t("brand.valueProp"), value: valueProp.trim() || none },
        ...icps.map((i, n) => ({ label: t("brand.customer", { n: n + 1 }), value: i.title.trim() || none })),
      ]}
      factsTitle={t("brand.facts")}
      showBack={showBack}
      flipLabels={{ toBack: t("flip.toBack"), toFront: t("flip.toFront") }}
    >
      <p className={valueProp.trim() ? "line-clamp-4 text-body" : "text-body text-ink-muted"}>{valueProp.trim() || t("brand.valuePropPlaceholder")}</p>
      <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
        {named.map((i) => <span key={i.title} className="rounded-chip border border-rule bg-surface px-2.5 py-0.5 text-caption">{i.title}</span>)}
      </div>
    </PreviewCard>
  );
}
