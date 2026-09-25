import "server-only";

import { and, count, eq, inArray, isNotNull, max } from "drizzle-orm";
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
    const [[posts], [links], [clickRows], [signups]] = await Promise.all([
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
    ]);
    return {
      posts: posts.n,
      links: links.n,
      clicks: clickRows.n,
      signups: signups.n,
      lastClickAt: clickRows.last ? clickRows.last.toISOString() : null,
      asOf: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[public] trail read failed", { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

export const getPublicTrail = cachedRead(loadTrail, ["public-trail"], { tags: ["public:trail"], revalidate: TRAIL_TTL_S });
