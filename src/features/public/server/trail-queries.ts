import "server-only";

import { and, count, desc, eq, inArray, isNotNull, max, sql, sum } from "drizzle-orm";
import { cachedRead } from "@/db/cache";
import { brands, campaigns, clicks, collaborations, pixelEvents, trackingLinks, users } from "@/db/schema";
import { getDb, isDbConfigured } from "@/db";
import { DEMO_ACCOUNTS } from "@/features/auth/constants";
import { TRAIL_TTL_S, type PublicTrail } from "../constants";

// The landing hero's trail, for real: the demo workspace's published posts →
// their tracked links → the clicks on them → the sign-ups the pixel attributed
// to a click. Counts only, no names; read from the database, cached for a
// minute, and labelled "demo workspace data" wherever it is shown.
const DEMO_BRAND_EMAILS = [DEMO_ACCOUNTS.brand.email, DEMO_ACCOUNTS.brand.legacyEmail];

async function loadTrail(): Promise<PublicTrail | null> {
  if (!isDbConfigured()) return null;
  try {
    const db = getDb();
    const [brand] = await db
      .select({ id: brands.id })
      .from(brands)
      .innerJoin(users, eq(users.id, brands.ownerUserId))
      .where(inArray(users.email, DEMO_BRAND_EMAILS))
      .limit(1);
    if (!brand) return null;

    const ofBrand = eq(campaigns.brandId, brand.id);
    const [[posts], [links], [clickRows], [signups], [paid]] = await Promise.all([
      db.select({ n: count() }).from(collaborations).innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId)).where(and(ofBrand, isNotNull(collaborations.publishedAt))),
      db.select({ n: count() }).from(trackingLinks).innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId)).innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId)).where(ofBrand),
      db
        .select({ n: count(), last: max(clicks.clickedAt) })
        .from(clicks)
        .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
        .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
        .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
        .where(ofBrand),
      db.select({ n: count() }).from(pixelEvents).where(and(eq(pixelEvents.brandId, brand.id), eq(pixelEvents.type, "signup"), isNotNull(pixelEvents.clickId))),
      // the bill: what the demo brand paid for the posts it paid for
      db.select({ n: count(), cents: sum(collaborations.feeCents) }).from(collaborations).innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId)).where(and(ofBrand, isNotNull(collaborations.paidAt))),
    ]);
    // one real paid post, end to end: its fee, the clicks on its link, the sign-ups those clicks became
    const [example] = await db
      .select({
        feeCents: collaborations.feeCents,
        clicks: sql<number>`count(distinct ${clicks.id})`.mapWith(Number),
        signups: sql<number>`count(distinct ${pixelEvents.id})`.mapWith(Number),
      })
      .from(collaborations)
      .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
      .innerJoin(trackingLinks, eq(trackingLinks.collaborationId, collaborations.id))
      .leftJoin(clicks, eq(clicks.trackingLinkId, trackingLinks.id))
      .leftJoin(pixelEvents, and(eq(pixelEvents.clickId, clicks.id), eq(pixelEvents.type, "signup")))
      .where(and(ofBrand, isNotNull(collaborations.paidAt)))
      .groupBy(collaborations.id)
      .orderBy(desc(sql`count(distinct ${clicks.id})`))
      .limit(1);
    return {
      example: example ?? null,
      posts: posts.n,
      links: links.n,
      clicks: clickRows.n,
      signups: signups.n,
      paidPosts: paid.n,
      paidCents: Number(paid.cents ?? 0),
      lastClickAt: clickRows.last ? clickRows.last.toISOString() : null,
      asOf: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[public] trail read failed", { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

export const getPublicTrail = cachedRead(loadTrail, ["public-trail"], { tags: ["public:trail"], revalidate: TRAIL_TTL_S });
