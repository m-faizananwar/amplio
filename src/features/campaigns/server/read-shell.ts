import "server-only";
import type { CampaignShellDto } from "../schemas";
import { getCampaignClickCount } from "./read-analytics";
import { getBrandProfile, getCampaign, listCampaignSummaries } from "./read-campaigns";
import { estimateFor, listCampaignCreators } from "./read-creators";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

// Everything the campaign detail header needs, for every tab.
async function loadCampaignShell(brandId: string, campaignId: string): Promise<CampaignShellDto | null> {
  const [campaign, brand, summaries] = await Promise.all([getCampaign(brandId, campaignId), getBrandProfile(brandId), listCampaignSummaries(brandId)]);
  if (!campaign || !brand) return null;
  if (campaign.status === "draft") return { campaign, brand, summaries, projection: null };
  const [creators, actualClicks] = await Promise.all([listCampaignCreators(campaign, brand), getCampaignClickCount(campaignId)]);
  return { campaign, brand, summaries, projection: { estimate: await estimateFor(creators), actualClicks } };
}

// The campaign header every campaign sub-route renders.
export function getCampaignShell(brandId: string, campaignId: string) {
  return cachedRead(loadCampaignShell, ["campaign-shell"], { tags: [tag.brandCampaigns(brandId), tag.campaign(campaignId)] })(brandId, campaignId);
}
