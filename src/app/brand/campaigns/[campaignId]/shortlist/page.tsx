import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { CampaignHeader } from "@/features/campaigns/components/detail/CampaignHeader";
import { CampaignNotFound } from "@/features/campaigns/components/detail/CampaignNotFound";
import { ShortlistTab } from "@/features/campaigns/components/detail/ShortlistTab";
import { getCampaignShell, listShortlistCreators } from "@/features/campaigns/server/queries";
import { requireBrand } from "@/features/campaigns/server/require-brand";
import { safeQuery } from "@/features/campaigns/server/safe-query";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Shortlist · ${BRAND.wordmark}` };

type Props = { params: Promise<{ campaignId: string }> };

export default async function CampaignShortlistPage({ params }: Props) {
  const { campaignId } = await params;
  const viewer = await requireBrand(`/brand/campaigns/${campaignId}/shortlist`);
  const t = await getTranslations("brand.campaigns.detail");
  const result = await safeQuery("campaign shortlist", { brandId: viewer.brand.id, campaignId }, async () => {
    const shell = await getCampaignShell(viewer.brand.id, campaignId);
    if (!shell) return null;
    const creators = await listShortlistCreators(shell.campaign, shell.brand);
    return { shell, creators };
  });
  if (!result.ok) return <ErrorState body={t("error")} retryHref={`/brand/campaigns/${campaignId}/shortlist`} />;
  if (!result.data) return <CampaignNotFound />;
  const { shell, creators } = result.data;
  return (
    <CampaignHeader shell={shell} tab="shortlist">
      <ShortlistTab campaignId={campaignId} creators={creators} canInvite={shell.campaign.status === "active"} />
    </CampaignHeader>
  );
}
