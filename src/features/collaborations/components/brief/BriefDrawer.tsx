"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { primaryCta } from "@/lib/brief-markdown";
import type { BriefDto } from "../../schemas";
import { BriefAngleCard } from "./BriefAngleCard";
import { BriefSection } from "./BriefSection";
import { CopyForAiButton } from "./CopyForAiButton";
import { CopyMarkdownButton } from "./CopyMarkdownButton";

type Props = { brief: BriefDto; open: boolean; onOpenChange: (open: boolean) => void };

function List({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-ink-muted">{empty}</p>;
  return <ul className="list-disc space-y-1 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <p><span className="text-ink-muted">{label}: </span>{children}</p>;
}

function BriefBody({ brief }: { brief: BriefDto }) {
  const t = useTranslations("collaboration.briefDrawer");
  const format = useFormatter();
  return (
    <>
        <BriefSection title={t("sections.objectives")}>
        <p className="whitespace-pre-line">{brief.whatToTell}</p>
        <Field label={t("fields.primaryCta")}>{primaryCta(brief)}</Field>
        <Field label={t("fields.secondaryWin")}>{t("secondaryWinValue")}</Field>
      </BriefSection>
      <BriefSection title={t("sections.audience")}>
        <Field label={t("fields.brand")}>{brief.brandCompany}{brief.campaignDescription ? ` — ${brief.campaignDescription}` : ""}</Field>
        {brief.valueProp ? <Field label={t("fields.valueProp")}>{brief.valueProp}</Field> : null}
        <p className="text-ink-muted">{t("fields.icp")}</p>
        <List items={brief.icpTitles} empty={t("empty.icp")} />
        <Field label={t("fields.industries")}>{brief.targetIndustries.join(" · ") || t("any")}</Field>
        <Field label={t("fields.regions")}>{brief.targetGeos.join(" · ") || t("any")}</Field>
      </BriefSection>
      <BriefSection title={t("sections.guidelines")}>
        <p className="text-ink-muted">{t("fields.do")}</p>
        <List items={brief.do} empty="—" />
        <p className="text-ink-muted">{t("fields.avoid")}</p>
        <List items={brief.avoid} empty="—" />
        <Field label={t("fields.tone")}>{brief.tone}</Field>
      </BriefSection>
      <BriefSection title={t("sections.angles", { count: brief.angles.length })}>
        {brief.angles.length === 0 ? <p className="text-ink-muted">{t("empty.angles")}</p> : brief.angles.map((a, i) => <BriefAngleCard key={`${i}-${a.angle}`} index={i + 1} angle={a} />)}
      </BriefSection>
      <BriefSection title={t("sections.links")}>
        <List items={brief.links} empty={t("empty.links")} />
        <Field label={t("fields.trackedLink")}>{brief.trackedUrl ? <span className="num break-all">{brief.trackedUrl}</span> : <span className="text-ink-muted">{t("empty.trackedLink")}</span>}</Field>
      </BriefSection>
      <BriefSection title={t("sections.deadline")}>
        <p className="num">{brief.postDeadline ? format.dateTime(new Date(brief.postDeadline), { dateStyle: "long" }) : t("empty.deadline")}</p>
      </BriefSection>
    </>
  );
}

// The whole brief in a right-hand drawer, opened from an opportunity or a
// collaboration: what the post should do, for whom, the rules, the angles.
export function BriefDrawer({ brief, open, onOpenChange }: Props) {
  const t = useTranslations("collaboration.briefDrawer");
  const site = brief.brandWebsite ? ` · ${brief.brandWebsite.replace(/^https?:\/\//, "")}` : "";
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        width="wide"
        heading={t("title", { campaign: brief.campaignName })}
        description={`${t("byBrand", { brand: brief.brandCompany })}${site}`}
        closeLabel={t("close")}
        footer={<div className="flex flex-wrap gap-2"><CopyForAiButton brief={brief} /><CopyMarkdownButton brief={brief} /></div>}
      >
        <div className="border-b border-rule bg-paper px-5 py-4">
          <p className="font-medium">{t("aiCard.title")}</p>
          <p className="text-small text-ink-muted">{t("aiCard.body")}</p>
        </div>
        <BriefBody brief={brief} />
      </DrawerContent>
    </Drawer>
  );
}
