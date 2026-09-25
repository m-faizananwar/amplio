import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cachedRead } from "@/db/cache";
import { clicks, collaborations, creators, pixelEvents, trackingLinks } from "@/db/schema";
import { tag } from "@/lib/cache-tags";
import type { ObservedSample } from "@/lib/estimator";

// Everything the estimator is allowed to know: collaborations that went live
// on Amplio with a tracked link, the reach behind them, the clicks those links
// got, and the sign-ups the pixel tied back to those clicks. Aggregates only,
// marketplace-wide — no brand sees another brand's rows.
async function loadObservedSample(): Promise<ObservedSample> {
  const live = sql`${collaborations.status} in ('live', 'paid')`;
  const [row] = await getDb()
    .select({
      livePosts: sql<number>`count(distinct ${collaborations.id})::int`,
      views: sql<number>`coalesce(sum(${creators.medianViews}), 0)::int`,
      clicks: sql<number>`(select count(*) from ${clicks} k join ${trackingLinks} t on t.id = k.tracking_link_id join ${collaborations} c on c.id = t.collaboration_id where c.status in ('live', 'paid'))::int`,
      signups: sql<number>`(select count(*) from ${pixelEvents} p join ${clicks} k on k.id = p.click_id join ${trackingLinks} t on t.id = k.tracking_link_id join ${collaborations} c on c.id = t.collaboration_id where p.type = 'signup' and c.status in ('live', 'paid'))::int`,
    })
    .from(collaborations)
    .innerJoin(trackingLinks, sql`${trackingLinks.collaborationId} = ${collaborations.id}`)
    .innerJoin(creators, sql`${creators.id} = ${collaborations.creatorId}`)
    .where(live);
  return { livePosts: row?.livePosts ?? 0, views: row?.views ?? 0, clicks: row?.clicks ?? 0, signups: row?.signups ?? 0 };
}

// Cached marketplace-wide; a click, a pixel event or a post going live drops it.
export function getObservedSample(): Promise<ObservedSample> {
  return cachedRead(loadObservedSample, ["observed-sample"], { tags: [tag.marketplaceRates()] })();
}
