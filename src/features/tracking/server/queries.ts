import "server-only";
import { and, count, countDistinct, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, clicks, collaborations, creatorPosts, creators, ledgerEntries, pixelEvents, trackingLinks, users } from "@/db/schema";
import { CSV_MAX_ROWS, RESULTS_WINDOW_DAYS, SERIES_DAYS, type SeriesRange } from "../constants";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

const DAY_MS = 86_400_000;
const DETAIL_ROWS = 6;
const PUBLISHED = ["live", "paid"] as const;

export type ResultsSummary = {
  estReach: number;
  publishedPosts: number;
  clicksInWindow: number;
  windowDays: number;
  committedCents: number;
  bookings: number;
  signups: number;
};
export type SeriesPoint = { day: string; clicks: number };
export type CreatorAttribution = {
  creatorId: string;
  name: string;
  avatarUrl: string;
  campaign: string;
  clicks: number;
  visits: number;
  signups: number;
  purchases: number;
};
export type PixelStatus = { siteKey: string; active: boolean; events: number; lastEventAt: string | null };
export type PublishedPost = {
  collaborationId: string;
  creator: string;
  avatarUrl: string;
  campaign: string;
  postUrl: string | null;
  publishedAt: string | null;
  trackedUrl: string;
  clicks: number;
  // "Latest metrics collected from your posts": the creator's recent public posts (LinkedIn's own numbers are not imported).
  avgReactions: number;
  avgComments: number;
};
export type AttributionDetails = {
  byCountry: Array<{ country: string; clicks: number }>;
  byReferrer: Array<{ referrer: string; clicks: number }>;
  events: { visits: number; signups: number; purchases: number; revenueCents: number };
};
export type ClickLogRow = {
  clickedAt: string;
  creator: string;
  campaign: string;
  code: string;
  country: string | null;
  referrer: string | null;
  userAgent: string | null;
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, "YYYY-MM-DD".length);
}

// Base join: every click of this brand with its creator and campaign.
function brandClicks(brandId: string, creatorId?: string) {
  return getDb()
    .select({
      clickId: clicks.id,
      clickedAt: clicks.clickedAt,
      country: clicks.country,
      referrer: clicks.referrer,
      userAgent: clicks.userAgent,
      code: trackingLinks.code,
      creatorId: creators.id,
      creatorName: sql<string>`${creators.handle}`,
      campaign: campaigns.name,
    })
    .from(clicks)
    .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .where(and(eq(campaigns.brandId, brandId), creatorId ? eq(creators.id, creatorId) : undefined));
}

async function loadResultsSummary(brandId: string): Promise<ResultsSummary> {
  const db = getDb();
  const since = new Date(Date.now() - RESULTS_WINDOW_DAYS * DAY_MS);
  const [published] = await db
    .select({ posts: count(), reach: sql<number>`coalesce(sum(${creators.medianViews}), 0)::int` })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .where(and(eq(campaigns.brandId, brandId), inArray(collaborations.status, [...PUBLISHED])));
  const [clicksRow] = await db
    .select({ n: count() })
    .from(clicks)
    .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .where(and(eq(campaigns.brandId, brandId), gte(clicks.clickedAt, since)));
  const [budget] = await db
    .select({ committed: sql<number>`coalesce(-sum(${ledgerEntries.amountCents}), 0)::int`, bookings: count() })
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.brandId, brandId), eq(ledgerEntries.type, "booking")));
  const [signups] = await db
    .select({ n: count() })
    .from(pixelEvents)
    .where(and(eq(pixelEvents.brandId, brandId), eq(pixelEvents.type, "signup")));
  return {
    estReach: published?.reach ?? 0,
    publishedPosts: published?.posts ?? 0,
    clicksInWindow: clicksRow?.n ?? 0,
    windowDays: RESULTS_WINDOW_DAYS,
    committedCents: budget?.committed ?? 0,
    bookings: budget?.bookings ?? 0,
    signups: signups?.n ?? 0,
  };
}

async function loadClicksSeries(brandId: string, range: SeriesRange): Promise<SeriesPoint[]> {
  const days = SERIES_DAYS[range];
  const since = new Date(Date.now() - (days - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);
  const rows = await getDb()
    .select({ day: sql<string>`to_char(${clicks.clickedAt} at time zone 'UTC', 'YYYY-MM-DD')`, n: count() })
    .from(clicks)
    .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .where(and(eq(campaigns.brandId, brandId), gte(clicks.clickedAt, since)))
    .groupBy(sql`1`);
  const byDay = new Map(rows.map((r) => [r.day, r.n]));
  return Array.from({ length: days }, (_, i) => {
    const day = dayKey(new Date(since.getTime() + i * DAY_MS));
    return { day, clicks: byDay.get(day) ?? 0 };
  });
}

async function loadAttributionByCreator(brandId: string): Promise<CreatorAttribution[]> {
  const db = getDb();
  const rows = await db
    .select({
      creatorId: creators.id,
      handle: creators.handle,
      avatarUrl: creators.avatarUrl,
      campaign: campaigns.name,
      clicks: countDistinct(clicks.id),
      visits: sql<number>`count(*) filter (where ${pixelEvents.type} = 'visit')::int`,
      signups: sql<number>`count(*) filter (where ${pixelEvents.type} = 'signup')::int`,
      purchases: sql<number>`count(*) filter (where ${pixelEvents.type} = 'purchase')::int`,
    })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(trackingLinks, eq(trackingLinks.collaborationId, collaborations.id))
    .leftJoin(clicks, eq(clicks.trackingLinkId, trackingLinks.id))
    .leftJoin(pixelEvents, eq(pixelEvents.clickId, clicks.id))
    .where(eq(campaigns.brandId, brandId))
    .groupBy(creators.id, creators.handle, creators.avatarUrl, campaigns.name)
    .orderBy(desc(countDistinct(clicks.id)));
  const names = await creatorNames(rows.map((r) => r.creatorId));
  return rows.map((r) => ({
    creatorId: r.creatorId,
    name: names.get(r.creatorId) ?? r.handle,
    avatarUrl: r.avatarUrl,
    campaign: r.campaign,
    clicks: r.clicks,
    visits: r.visits,
    signups: r.signups,
    purchases: r.purchases,
  }));
}

async function creatorNames(creatorIds: string[]) {
  if (creatorIds.length === 0) return new Map<string, string>();
  const rows = await getDb()
    .select({ id: creators.id, firstName: users.firstName, lastName: users.lastName })
    .from(creators)
    .innerJoin(users, eq(users.id, creators.userId))
    .where(inArray(creators.id, creatorIds));
  return new Map(rows.map((r) => [r.id, `${r.firstName} ${r.lastName}`]));
}

async function loadPixelStatus(brandId: string): Promise<PixelStatus | null> {
  const db = getDb();
  const [brand] = await db.select({ siteKey: brands.pixelSiteKey }).from(brands).where(eq(brands.id, brandId));
  if (!brand) return null;
  const [agg] = await db
    .select({ n: count(), last: sql<string | null>`max(${pixelEvents.occurredAt})` })
    .from(pixelEvents)
    .where(eq(pixelEvents.brandId, brandId));
  return { siteKey: brand.siteKey, active: (agg?.n ?? 0) > 0, events: agg?.n ?? 0, lastEventAt: agg?.last ?? null };
}

async function loadPublishedPosts(brandId: string, origin: string): Promise<PublishedPost[]> {
  const rows = await getDb()
    .select({
      collaborationId: collaborations.id,
      creatorId: creators.id,
      handle: creators.handle,
      avatarUrl: creators.avatarUrl,
      campaign: campaigns.name,
      postUrl: collaborations.postUrl,
      publishedAt: collaborations.publishedAt,
      code: trackingLinks.code,
      clicks: countDistinct(clicks.id),
      avgReactions: sql<number>`coalesce((select avg(${creatorPosts.reactions}) from ${creatorPosts} where ${creatorPosts.creatorId} = ${creators.id}), 0)::int`,
      avgComments: sql<number>`coalesce((select avg(${creatorPosts.comments}) from ${creatorPosts} where ${creatorPosts.creatorId} = ${creators.id}), 0)::int`,
    })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(trackingLinks, eq(trackingLinks.collaborationId, collaborations.id))
    .leftJoin(clicks, eq(clicks.trackingLinkId, trackingLinks.id))
    .where(and(eq(campaigns.brandId, brandId), inArray(collaborations.status, [...PUBLISHED])))
    .groupBy(collaborations.id, creators.id, creators.handle, creators.avatarUrl, campaigns.name, trackingLinks.code)
    .orderBy(desc(collaborations.publishedAt));
  const names = await creatorNames(rows.map((r) => r.creatorId));
  return rows.map((r) => ({
    collaborationId: r.collaborationId,
    creator: names.get(r.creatorId) ?? r.handle,
    avatarUrl: r.avatarUrl,
    campaign: r.campaign,
    postUrl: r.postUrl,
    publishedAt: r.publishedAt?.toISOString() ?? null,
    trackedUrl: `${origin}/r/${r.code}`,
    clicks: r.clicks,
    avgReactions: r.avgReactions,
    avgComments: r.avgComments,
  }));
}

// "More metrics & attribution details": where the clicks came from and what the pixel saw.
async function loadAttributionDetails(brandId: string): Promise<AttributionDetails> {
  const db = getDb();
  const base = brandClicks(brandId).as("bc");
  const byCountry = await db
    .select({ country: sql<string>`coalesce(${base.country}, 'Unknown')`, clicks: count() })
    .from(base)
    .groupBy(sql`1`)
    .orderBy(desc(count()))
    .limit(DETAIL_ROWS);
  const byReferrer = await db
    .select({ referrer: sql<string>`coalesce(${base.referrer}, 'Direct')`, clicks: count() })
    .from(base)
    .groupBy(sql`1`)
    .orderBy(desc(count()))
    .limit(DETAIL_ROWS);
  const [events] = await db
    .select({
      visits: sql<number>`count(*) filter (where ${pixelEvents.type} = 'visit')::int`,
      signups: sql<number>`count(*) filter (where ${pixelEvents.type} = 'signup')::int`,
      purchases: sql<number>`count(*) filter (where ${pixelEvents.type} = 'purchase')::int`,
      revenueCents: sql<number>`coalesce(sum(${pixelEvents.valueCents}), 0)::int`,
    })
    .from(pixelEvents)
    .where(eq(pixelEvents.brandId, brandId));
  return {
    byCountry: byCountry.map((r) => ({ country: r.country, clicks: r.clicks })),
    byReferrer: byReferrer.map((r) => ({ referrer: r.referrer.replace(/^https?:\/\//, "").replace(/\/$/, ""), clicks: r.clicks })),
    events: events ?? { visits: 0, signups: 0, purchases: 0, revenueCents: 0 },
  };
}

async function loadClickLog(brandId: string, creatorId?: string): Promise<ClickLogRow[]> {
  const rows = await brandClicks(brandId, creatorId).orderBy(desc(clicks.clickedAt)).limit(CSV_MAX_ROWS);
  const names = await creatorNames([...new Set(rows.map((r) => r.creatorId))]);
  return rows.map((r) => ({
    clickedAt: r.clickedAt.toISOString(),
    creator: names.get(r.creatorId) ?? r.creatorName,
    campaign: r.campaign,
    code: r.code,
    country: r.country,
    referrer: r.referrer,
    userAgent: r.userAgent,
  }));
}

// Attribution reads: dirtied by a click, a pixel event, or a collaboration
// going live. `origin` is part of the key because the post links carry it.
export function getResultsSummary(brandId: string) {
  return cachedRead(loadResultsSummary, ["results-summary"], { tags: [tag.brandResults(brandId)] })(brandId);
}

export function getClicksSeries(brandId: string, range: SeriesRange) {
  return cachedRead(loadClicksSeries, ["clicks-series"], { tags: [tag.brandResults(brandId)] })(brandId, range);
}

export function getAttributionByCreator(brandId: string) {
  return cachedRead(loadAttributionByCreator, ["attribution-by-creator"], { tags: [tag.brandResults(brandId)] })(brandId);
}

export function getPixelStatus(brandId: string) {
  return cachedRead(loadPixelStatus, ["pixel-status"], { tags: [tag.brandResults(brandId)] })(brandId);
}

export function getPublishedPosts(brandId: string, origin: string) {
  return cachedRead(loadPublishedPosts, ["published-posts"], { tags: [tag.brandResults(brandId)] })(brandId, origin);
}

export function getAttributionDetails(brandId: string) {
  return cachedRead(loadAttributionDetails, ["attribution-details"], { tags: [tag.brandResults(brandId)] })(brandId);
}

export function getClickLog(brandId: string, creatorId?: string) {
  return cachedRead(loadClickLog, ["click-log"], { tags: [tag.brandResults(brandId)] })(brandId, creatorId);
}
