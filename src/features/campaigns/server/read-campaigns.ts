import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, collaborations, creators, ledgerEntries, shortlist, users } from "@/db/schema";
import type { BrandProfile, CampaignCardDto, CampaignDto, CampaignSummaryDto, CollaborationRowDto, LaunchPlanDto } from "../schemas";
import { toCampaignDto, toCollaborationRowDto } from "./dto";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

async function loadBrandProfile(brandId: string): Promise<BrandProfile | null> {
  const [row] = await getDb()
    .select({
      id: brands.id,
      company: brands.company,
      website: brands.website,
      valueProp: brands.valueProp,
      icps: brands.icps,
      targetIndustries: brands.targetIndustries,
      targetRegions: brands.targetRegions,
      walletCents: brands.walletCents,
    })
    .from(brands)
    .where(eq(brands.id, brandId));
  return row ?? null;
}

// Per-campaign counts for the cards: creators (any collaboration that was not
// declined), published (live or paid) and the committed budget (ledger bookings).
async function cardStats(campaignIds: string[]) {
  if (campaignIds.length === 0) return new Map<string, { creators: number; published: number; committedCents: number }>();
  const db = getDb();
  const collabStats = await db
    .select({
      campaignId: collaborations.campaignId,
      creators: sql<number>`count(*) filter (where ${collaborations.status} <> 'declined')::int`,
      published: sql<number>`count(*) filter (where ${collaborations.status} in ('live', 'paid'))::int`,
    })
    .from(collaborations)
    .where(inArray(collaborations.campaignId, campaignIds))
    .groupBy(collaborations.campaignId);
  const bookings = await db
    .select({
      campaignId: collaborations.campaignId,
      committedCents: sql<number>`coalesce(-sum(${ledgerEntries.amountCents}), 0)::int`,
    })
    .from(ledgerEntries)
    .innerJoin(collaborations, eq(collaborations.id, ledgerEntries.collaborationId))
    .where(and(inArray(collaborations.campaignId, campaignIds), eq(ledgerEntries.type, "booking")))
    .groupBy(collaborations.campaignId);

  const empty = { creators: 0, published: 0, committedCents: 0 };
  const stats = new Map(campaignIds.map((id) => [id, { ...empty }]));
  for (const row of collabStats) stats.set(row.campaignId, { ...(stats.get(row.campaignId) ?? empty), creators: row.creators, published: row.published });
  for (const row of bookings) stats.set(row.campaignId, { ...(stats.get(row.campaignId) ?? empty), committedCents: row.committedCents });
  return stats;
}

async function loadCampaignCards(brandId: string): Promise<CampaignCardDto[]> {
  const rows = await getDb().select().from(campaigns).where(eq(campaigns.brandId, brandId)).orderBy(desc(campaigns.createdAt));
  const stats = await cardStats(rows.map((r) => r.id));
  return rows.map((row) => ({ ...toCampaignDto(row), ...(stats.get(row.id) ?? { creators: 0, published: 0, committedCents: 0 }) }));
}

async function loadCampaign(brandId: string, campaignId: string): Promise<CampaignDto | null> {
  const [row] = await getDb()
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, brandId)));
  return row ? toCampaignDto(row) : null;
}

async function loadCampaignSummaries(brandId: string): Promise<CampaignSummaryDto[]> {
  return getDb()
    .select({ id: campaigns.id, name: campaigns.name, status: campaigns.status })
    .from(campaigns)
    .where(eq(campaigns.brandId, brandId))
    .orderBy(desc(campaigns.createdAt));
}




// GET STARTED popover: each step is true when a row proves it happened.
async function loadLaunchPlan(brandId: string): Promise<LaunchPlanDto> {
  const db = getDb();
  const [explored] = await db.select({ id: shortlist.id }).from(shortlist).where(eq(shortlist.brandId, brandId)).limit(1);
  const [briefed] = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(and(eq(campaigns.brandId, brandId), sql`coalesce(${campaigns.brief} ->> 'whatToTell', '') <> ''`))
    .limit(1);
  const [invited] = await db
    .select({ id: collaborations.id })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .where(and(eq(campaigns.brandId, brandId), eq(collaborations.origin, "invitation")))
    .limit(1);
  const steps = [Boolean(explored), Boolean(briefed), Boolean(invited)];
  return { explored: steps[0], briefed: steps[1], invited: steps[2], stepsLeft: steps.filter((s) => !s).length };
}

// Campaign reads. Rows on one campaign carry that campaign's tag as well, so a
// status change there does not drop the whole brand's list.
export function getBrandProfile(brandId: string) {
  return cachedRead(loadBrandProfile, ["brand-profile"], { tags: [tag.brandSettings(brandId)] })(brandId);
}

export function listCampaignCards(brandId: string) {
  return cachedRead(loadCampaignCards, ["campaign-cards"], { tags: [tag.brandCampaigns(brandId)] })(brandId);
}

export function getCampaign(brandId: string, campaignId: string) {
  return cachedRead(loadCampaign, ["campaign"], { tags: [tag.brandCampaigns(brandId), tag.campaign(campaignId)] })(brandId, campaignId);
}

export function listCampaignSummaries(brandId: string) {
  return cachedRead(loadCampaignSummaries, ["campaign-summaries"], { tags: [tag.brandCampaigns(brandId)] })(brandId);
}




export function getLaunchPlan(brandId: string) {
  return cachedRead(loadLaunchPlan, ["launch-plan"], { tags: [tag.brandCampaigns(brandId)] })(brandId);
}
