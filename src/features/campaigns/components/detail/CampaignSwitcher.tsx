"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CampaignSummaryDto } from "../../schemas";

type Props = { current: string; summaries: CampaignSummaryDto[]; tab: string };

// Jump to the same section of another campaign.
export function CampaignSwitcher({ current, summaries, tab }: Props) {
  const t = useTranslations("brand.campaigns.detail");
  const router = useRouter();
  if (summaries.length < 2) return null;
  return (
    <Select value={current} items={Object.fromEntries(summaries.map((c) => [c.id, c.name]))} onValueChange={(v) => router.push(`/brand/campaigns/${String(v)}${tab}`)}>
      <SelectTrigger size="sm" className="max-w-56" aria-label={t("switch")}><SelectValue /></SelectTrigger>
      <SelectContent>{summaries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
    </Select>
  );
}
