import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { BriefEditor } from "@/features/campaigns/components/brief/BriefEditor";
import { CampaignNotFound } from "@/features/campaigns/components/detail/CampaignNotFound";
import { getCampaign } from "@/features/campaigns/server/queries";
import { requireBrand } from "@/features/campaigns/server/require-brand";
import { safeQuery } from "@/features/campaigns/server/safe-query";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Edit the brief · ${BRAND.wordmark}` };

type Props = { params: Promise<{ campaignId: string }> };

export default async function EditBriefPage({ params }: Props) {
  const { campaignId } = await params;
  const viewer = await requireBrand(`/brand/campaigns/${campaignId}/brief/edit`);
  const t = await getTranslations("brand.campaigns.brief");
  const result = await safeQuery("edit brief", { brandId: viewer.brand.id, campaignId }, () => getCampaign(viewer.brand.id, campaignId));
  if (!result.ok) return <ErrorState body={t("error")} retryHref={`/brand/campaigns/${campaignId}/brief`} />;
  if (!result.data) return <CampaignNotFound />;
  const campaign = result.data;
  const briefHref = `/brand/campaigns/${campaignId}/brief`;
  return (
    <>
      <PageHeader eyebrow={campaign.name} title={t("editTitle")} description={t("editDescription")} />
      <BriefEditor campaignId={campaignId} initial={campaign.brief} cancelHref={briefHref} afterSaveHref={briefHref} />
    </>
  );
}
