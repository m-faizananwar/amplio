import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { AnalyticsTab } from "@/features/campaigns/components/analytics/AnalyticsTab";
import { CampaignHeader } from "@/features/campaigns/components/detail/CampaignHeader";
import { CampaignNotFound } from "@/features/campaigns/components/detail/CampaignNotFound";
import { getCampaignAnalytics, getCampaignShell } from "@/features/campaigns/server/queries";
import { requireBrand } from "@/features/campaigns/server/require-brand";
import { safeQuery } from "@/features/campaigns/server/safe-query";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Campaign analytics · ${BRAND.wordmark}` };

type Props = { params: Promise<{ campaignId: string }> };

export default async function CampaignAnalyticsPage({ params }: Props) {
  const { campaignId } = await params;
  const viewer = await requireBrand(`/brand/campaigns/${campaignId}/analytics`);
  const t = await getTranslations("brand.campaigns.detail");
  const result = await safeQuery("campaign analytics", { brandId: viewer.brand.id, campaignId }, async () => {
    const shell = await getCampaignShell(viewer.brand.id, campaignId);
    if (!shell) return null;
    return { shell, analytics: await getCampaignAnalytics(campaignId) };
  });
  if (!result.ok) return <ErrorState body={t("error")} retryHref={`/brand/campaigns/${campaignId}/analytics`} />;
  if (!result.data) return <CampaignNotFound />;
  const { shell, analytics } = result.data;
  return (
    <CampaignHeader shell={shell} tab="analytics">
      <AnalyticsTab analytics={analytics} />
    </CampaignHeader>
  );
}
