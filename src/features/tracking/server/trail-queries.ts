import "server-only";
import { and, desc, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { cachedRead } from "@/db/cache";
import { campaigns, clicks, collaborations, creators, pixelEvents, trackingLinks, users } from "@/db/schema";
import { getBrandLedger } from "@/features/payouts/server/queries";
import { tag } from "@/lib/cache-tags";
import { TRAIL_ROW_LIMIT, TRAIL_WINDOW_DAYS } from "../constants";

const DAY_MS = 86_400_000;

// A row behind one of the brand's numbers, as raw facts: the view turns the
// referrer, device and kind into words in the reader's language.
export type BrandTrailRow = {
  id: string;
  at: string;
  creator: string | null;
  campaign: string | null;
  referrerHost: string | null;
  device: "mobile" | "desktop" | null;
  country: string | null;
  kind: "click" | "signup" | "post" | "topup" | "booking" | "payout" | "withdrawal";
  /** For a post: the creator's median views, which is what the reach estimate adds up. */
  views?: number;
  amountCents?: number;
  /** A booking still held (the creator hasn't accepted yet). */
  pending?: boolean;
  description?: string;
};

export type BrandTrail = { rows: BrandTrailRow[]; total: number; truncated: boolean };

function hostOf(referrer: string | null) {
  if (!referrer) return null;
  try {
    return new URL(referrer).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

const deviceOf = (ua: string | null) => (ua ? (/mobi|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop") : null);

function clicksQuery(brandId: string) {
  return getDb()
    .select({
      id: clicks.id, at: clicks.clickedAt, referrer: clicks.referrer, ua: clicks.userAgent, country: clicks.country,
      firstName: users.firstName, lastName: users.lastName, campaign: campaigns.name,
    })
    .from(clicks)
    .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(users, eq(users.id, creators.userId));
}

// Qualified clicks in the window the card counts (30 days), newest first.
async function loadClickTrail(brandId: string): Promise<BrandTrail> {
  const since = new Date(Date.now() - TRAIL_WINDOW_DAYS * DAY_MS);
  const rows = await clicksQuery(brandId).where(and(eq(campaigns.brandId, brandId), gte(clicks.clickedAt, since))).orderBy(desc(clicks.clickedAt));
  return trail(rows.map((r) => ({
    id: r.id, at: r.at.toISOString(), creator: `${r.firstName} ${r.lastName}`.trim(), campaign: r.campaign,
    referrerHost: hostOf(r.referrer), device: deviceOf(r.ua), country: r.country, kind: "click" as const,
  })));
}

// Sign-ups the pixel tied to a tracked click: attributed, so each has a creator.
async function loadSignupTrail(brandId: string): Promise<BrandTrail> {
  const rows = await getDb()
    .select({
      id: pixelEvents.id, at: pixelEvents.occurredAt, referrer: clicks.referrer, ua: clicks.userAgent, country: clicks.country,
      firstName: users.firstName, lastName: users.lastName, campaign: campaigns.name,
    })
    .from(pixelEvents)
    .innerJoin(clicks, eq(clicks.id, pixelEvents.clickId))
    .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .where(and(eq(pixelEvents.brandId, brandId), eq(pixelEvents.type, "signup"), isNotNull(pixelEvents.clickId)))
    .orderBy(desc(pixelEvents.occurredAt));
  return trail(rows.map((r) => ({
    id: r.id, at: r.at.toISOString(), creator: `${r.firstName} ${r.lastName}`.trim(), campaign: r.campaign,
    referrerHost: hostOf(r.referrer), device: deviceOf(r.ua), country: r.country, kind: "signup" as const,
  })));
}

// Estimated reach is the sum of the median views of creators whose post went
// live: one row per live post, with the number it contributes.
async function loadReachTrail(brandId: string): Promise<BrandTrail> {
  const rows = await getDb()
    .select({ id: collaborations.id, at: collaborations.publishedAt, views: creators.medianViews, firstName: users.firstName, lastName: users.lastName, campaign: campaigns.name })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .where(and(eq(campaigns.brandId, brandId), inArray(collaborations.status, ["live", "paid"])))
    .orderBy(desc(collaborations.publishedAt));
  return trail(rows.map((r) => ({
    id: r.id, at: (r.at ?? new Date(0)).toISOString(), creator: `${r.firstName} ${r.lastName}`.trim(), campaign: r.campaign,
    referrerHost: null, device: null, country: null, kind: "post" as const, views: r.views,
  })));
}

// Money out and in: every ledger row of the brand (top-ups, holds, refunds).
async function loadSpendTrail(brandId: string): Promise<BrandTrail> {
  const ledger = await getBrandLedger(brandId);
  return trail(ledger.map((r) => ({
    id: r.id, at: r.date, creator: null, campaign: null, referrerHost: null, device: null, country: null,
    kind: r.type, amountCents: r.amountCents, description: r.detail ?? r.description, pending: r.status === "pending",
  })));
}

function trail(rows: BrandTrailRow[]): BrandTrail {
  return { rows: rows.slice(0, TRAIL_ROW_LIMIT), total: rows.length, truncated: rows.length > TRAIL_ROW_LIMIT };
}

export type BrandTrailKind = "clicks" | "signups" | "spend" | "reach";

export function getBrandTrail(brandId: string, kind: BrandTrailKind): Promise<BrandTrail> {
  if (kind === "spend") return cachedRead(loadSpendTrail, ["trail-spend"], { tags: [tag.brandBilling(brandId)] })(brandId);
  const loader = kind === "clicks" ? loadClickTrail : kind === "reach" ? loadReachTrail : loadSignupTrail;
  return cachedRead(loader, [`trail-${kind}`], { tags: [tag.brandResults(brandId)] })(brandId);
}
