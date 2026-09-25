import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, collaborations, creators, ledgerEntries, shortlist, users } from "@/db/schema";
import { AI_HISTORY_LIMIT, COLLAB_TAB_STATUSES, type CollabTabKey } from "../constants";
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

// HISTORY rail on "Create with AI": past AI-generated campaigns, newest first.
async function loadAiHistory(brandId: string): Promise<CampaignSummaryDto[]> {
  return getDb()
    .select({ id: campaigns.id, name: campaigns.name, status: campaigns.status })
    .from(campaigns)
    .where(and(eq(campaigns.brandId, brandId), eq(campaigns.source, "ai")))
    .orderBy(desc(campaigns.createdAt))
    .limit(AI_HISTORY_LIMIT);
}

async function loadCollaborationRows(campaignId: string, tab: CollabTabKey): Promise<CollaborationRowDto[]> {
  const statusFilter = tab === "all" ? undefined : inArray(collaborations.status, [...COLLAB_TAB_STATUSES[tab]]);
  const rows = await getDb()
    .select({
      collab: collaborations,
      campaignName: campaigns.name,
      creator: { id: creators.id, avatarUrl: creators.avatarUrl },
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .where(and(eq(collaborations.campaignId, campaignId), statusFilter))
    .orderBy(desc(collaborations.updatedAt));
  return rows.map(toCollaborationRowDto);
}

async function loadCountCollaborationsByTab(campaignId: string): Promise<Record<CollabTabKey, number> & { committedCents: number }> {
  const db = getDb();
  const rows = await db
    .select({ status: collaborations.status, n: sql<number>`count(*)::int`, fee: sql<number>`coalesce(sum(${collaborations.feeCents}), 0)::int` })
    .from(collaborations)
    .where(eq(collaborations.campaignId, campaignId))
    .groupBy(collaborations.status);
  const count = (statuses: readonly string[]) => rows.filter((r) => statuses.includes(r.status)).reduce((s, r) => s + r.n, 0);
  const [committed] = await db
    .select({ cents: sql<number>`coalesce(-sum(${ledgerEntries.amountCents}), 0)::int` })
    .from(ledgerEntries)
    .innerJoin(collaborations, eq(collaborations.id, ledgerEntries.collaborationId))
    .where(and(eq(collaborations.campaignId, campaignId), eq(ledgerEntries.type, "booking")));
  return {
    all: rows.reduce((s, r) => s + r.n, 0),
    active: count(COLLAB_TAB_STATUSES.active),
    received: count(COLLAB_TAB_STATUSES.received),
    sent: count(COLLAB_TAB_STATUSES.sent),
    todo: count(COLLAB_TAB_STATUSES.todo),
    completed: count(COLLAB_TAB_STATUSES.completed),
    committedCents: committed?.cents ?? 0,
  };
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

export function listAiHistory(brandId: string) {
  return cachedRead(loadAiHistory, ["ai-history"], { tags: [tag.brandCampaigns(brandId)] })(brandId);
}

export function listCollaborationRows(campaignId: string, tab: CollabTabKey) {
  return cachedRead(loadCollaborationRows, ["collaboration-rows"], { tags: [tag.campaign(campaignId)] })(campaignId, tab);
}

export function countCollaborationsByTab(campaignId: string) {
  return cachedRead(loadCountCollaborationsByTab, ["collaboration-tab-counts"], { tags: [tag.campaign(campaignId)] })(campaignId);
}

export function getLaunchPlan(brandId: string) {
  return cachedRead(loadLaunchPlan, ["launch-plan"], { tags: [tag.brandCampaigns(brandId)] })(brandId);
}
