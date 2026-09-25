import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { isGeneratedWith } from "@/features/campaigns/components/launch/GeneratedWithBanner";
import { LaunchStepper } from "@/features/campaigns/components/launch/LaunchStepper";
import { CampaignNotFound } from "@/features/campaigns/components/detail/CampaignNotFound";
import { LAUNCH_STEPS, type LaunchStepKey } from "@/features/campaigns/constants";
import { getCampaignShell, getLaunchStepData } from "@/features/campaigns/server/queries";
import { requireBrand } from "@/features/campaigns/server/require-brand";
import { safeQuery } from "@/features/campaigns/server/safe-query";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Launch campaign · ${BRAND.wordmark}` };

type Props = { params: Promise<{ campaignId: string }>; searchParams: Promise<{ step?: string; creators?: string; generated?: string }> };

function stepOf(value: string | undefined): LaunchStepKey {
  return LAUNCH_STEPS.some((s) => s.key === value) ? (value as LaunchStepKey) : "basics";
}

export default async function LaunchCampaignPage({ params, searchParams }: Props) {
  const { campaignId } = await params;
  const query = await searchParams;
  const viewer = await requireBrand(`/brand/campaigns/${campaignId}/launch`);
  const step = stepOf(query.step);
  const creatorIds = (query.creators ?? "").split(",").filter(Boolean);

  const t = await getTranslations("brand.campaigns.detail");
  const result = await safeQuery("launch stepper", { brandId: viewer.brand.id, campaignId, step }, async () => {
    const shell = await getCampaignShell(viewer.brand.id, campaignId);
    if (!shell) return null;
    if (shell.campaign.status !== "draft") return { shell, data: null };
    return { shell, data: await getLaunchStepData({ step, campaign: shell.campaign, brand: shell.brand, creatorIds }) };
  });
  if (!result.ok) return <ErrorState body={t("error")} retryHref={`/brand/campaigns/${campaignId}`} />;
  if (!result.data) return <CampaignNotFound />;
  // Only drafts go through the stepper; a launched campaign has its own pages.
  if (!result.data.data) redirect(`/brand/campaigns/${campaignId}`);
  const { shell, data } = result.data;
  return <LaunchStepper campaign={shell.campaign} brand={shell.brand} data={data} generatedWith={isGeneratedWith(query.generated) ? query.generated : undefined} />;
}
