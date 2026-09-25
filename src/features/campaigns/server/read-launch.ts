import "server-only";
import type { LaunchStepKey } from "../constants";
import type { BrandProfile, CampaignDto, LaunchStepData } from "../schemas";
import { estimateFor, getCreatorPicks, listBestFitCreators } from "./read-creators";

type Input = { step: LaunchStepKey; campaign: CampaignDto; brand: BrandProfile; creatorIds: string[] };

// What each stepper step needs beyond the campaign itself.
export async function getLaunchStepData({ step, campaign, brand, creatorIds }: Input): Promise<LaunchStepData> {
  if (step === "creators") return { step, creators: await listBestFitCreators(campaign, brand) };
  if (step === "review") {
    const creators = await getCreatorPicks(creatorIds, campaign, brand);
    return { step, creators, estimate: await estimateFor(creators) };
  }
  return { step };
}
