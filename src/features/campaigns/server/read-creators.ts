import "server-only";
import { and, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { collaborations, creators, shortlist, users } from "@/db/schema";
import { estimate } from "@/lib/estimator";
import { getObservedSample } from "./read-rates";
import { fitScore } from "@/lib/fit-score";
import { BEST_FIT_LIMIT } from "../constants";
import type { BrandProfile, CampaignDto, CreatorPickDto, EstimateDto } from "../schemas";

type CreatorJoin = { creator: typeof creators.$inferSelect; firstName: string; lastName: string };

type PickContext = { campaign: CampaignDto; brand: BrandProfile; invitedIds: Set<string> };

function toPick(join: CreatorJoin, { campaign, brand, invitedIds }: PickContext): CreatorPickDto {
  const fit = fitScore(join.creator, { targetIndustries: campaign.brief.targetIndustries, icpTitles: brand.icps.map((i) => i.title) });
  return {
    id: join.creator.id,
    name: `${join.firstName} ${join.lastName}`.trim(),
    avatarUrl: join.creator.avatarUrl,
    headline: join.creator.headline,
    country: join.creator.country,
    industries: join.creator.industries,
    followers: join.creator.followers,
    medianViews: join.creator.medianViews,
    priceCents: join.creator.priceCents,
    fit: fit.score,
    reason: fit.reason,
    alreadyInvited: invitedIds.has(join.creator.id),
  };
}

async function invitedCreatorIds(campaignId: string) {
  const rows = await getDb().select({ creatorId: collaborations.creatorId }).from(collaborations).where(eq(collaborations.campaignId, campaignId));
  return new Set(rows.map((r) => r.creatorId));
}

const creatorSelect = { creator: creators, firstName: users.firstName, lastName: users.lastName };

// Stepper step 3: the brand's best-fit creators for this brief, ranked by fitScore.
export async function listBestFitCreators(campaign: CampaignDto, brand: BrandProfile, limit = BEST_FIT_LIMIT): Promise<CreatorPickDto[]> {
  const rows = await getDb().select(creatorSelect).from(creators).innerJoin(users, eq(users.id, creators.userId));
  const invited = await invitedCreatorIds(campaign.id);
  return rows
    .filter((r) => r.creator.headline.length > 0 && !invited.has(r.creator.id))
    .map((r) => toPick(r, { campaign, brand, invitedIds: invited }))
    .sort((a, b) => b.fit - a.fit || a.priceCents - b.priceCents)
    .slice(0, limit);
}

export async function listShortlistCreators(campaign: CampaignDto, brand: BrandProfile): Promise<CreatorPickDto[]> {
  const rows = await getDb()
    .select(creatorSelect)
    .from(shortlist)
    .innerJoin(creators, eq(creators.id, shortlist.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .where(eq(shortlist.brandId, brand.id));
  const invited = await invitedCreatorIds(campaign.id);
  return rows.map((r) => toPick(r, { campaign, brand, invitedIds: invited })).sort((a, b) => b.fit - a.fit);
}

export async function getCreatorPicks(ids: string[], campaign: CampaignDto, brand: BrandProfile): Promise<CreatorPickDto[]> {
  if (ids.length === 0) return [];
  const rows = await getDb()
    .select(creatorSelect)
    .from(creators)
    .innerJoin(users, eq(users.id, creators.userId))
    .where(and(inArray(creators.id, ids)));
  const invited = await invitedCreatorIds(campaign.id);
  return rows.map((r) => toPick(r, { campaign, brand, invitedIds: invited }));
}

// The selection × what Amplio has observed so far (src/lib/estimator.ts).
export async function estimateFor(picks: CreatorPickDto[]): Promise<EstimateDto> {
  return estimate(picks, await getObservedSample());
}

// Creators on an active campaign (declined ones never post), for the
// "Projected vs actual" header.
export async function listCampaignCreators(campaign: CampaignDto, brand: BrandProfile): Promise<CreatorPickDto[]> {
  const rows = await getDb()
    .select(creatorSelect)
    .from(collaborations)
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .where(and(eq(collaborations.campaignId, campaign.id), ne(collaborations.status, "declined")));
  const invited = new Set(rows.map((r) => r.creator.id));
  return rows.map((r) => toPick(r, { campaign, brand, invitedIds: invited }));
}
