import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { buttonVariants } from "@/components/ui/button";
import { BriefReadView } from "@/features/campaigns/components/brief/BriefReadView";
import { CampaignHeader } from "@/features/campaigns/components/detail/CampaignHeader";
import { CampaignNotFound } from "@/features/campaigns/components/detail/CampaignNotFound";
import { getCampaignShell } from "@/features/campaigns/server/queries";
import { requireBrand } from "@/features/campaigns/server/require-brand";
import { safeQuery } from "@/features/campaigns/server/safe-query";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Campaign brief · ${BRAND.wordmark}` };

type Props = { params: Promise<{ campaignId: string }> };

export default async function CampaignBriefPage({ params }: Props) {
  const { campaignId } = await params;
  const viewer = await requireBrand(`/brand/campaigns/${campaignId}/brief`);
  const t = await getTranslations("brand.campaigns.brief");
  const result = await safeQuery("campaign brief", { brandId: viewer.brand.id, campaignId }, () => getCampaignShell(viewer.brand.id, campaignId));
  if (!result.ok) return <ErrorState body={t("error")} retryHref={`/brand/campaigns/${campaignId}/brief`} />;
  if (!result.data) return <CampaignNotFound />;
  const shell = result.data;
  return (
    <CampaignHeader shell={shell} tab="brief">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-small text-ink-muted">{t("readHint")}</p>
        <Link href={`/brand/campaigns/${campaignId}/brief/edit`} className={buttonVariants({ variant: "secondary", size: "sm" })}>{t("edit")}</Link>
      </div>
      <BriefReadView brief={shell.campaign.brief} />
    </CampaignHeader>
  );
}
