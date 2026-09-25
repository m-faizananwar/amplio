import "server-only";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db";
import { expireTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { brands, campaigns, clicks, collaborations, trackingLinks } from "@/db/schema";
import { IP_HASH_SALT } from "../constants";

type ClickMeta = { ip: string | null; userAgent: string | null; referrer: string | null; country: string | null };

export type RecordClickResult = { kind: "ok"; clickId: string; destination: string; siteKey: string } | { kind: "unknown" } | { kind: "unconfigured" };

// The redirect handler's only dependency: look the code up, insert one row.
export async function recordClick(code: string, meta: ClickMeta): Promise<RecordClickResult> {
  if (!isDbConfigured()) return { kind: "unconfigured" };
  const db = getDb();
  const [link] = await db
    .select({
      id: trackingLinks.id,
      destination: trackingLinks.destination,
      siteKey: brands.pixelSiteKey,
      brandId: brands.id,
      creatorId: collaborations.creatorId,
      campaignId: collaborations.campaignId,
    })
    .from(trackingLinks)
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .where(eq(trackingLinks.code, code));
  if (!link) return { kind: "unknown" };
  const [click] = await db
    .insert(clicks)
    .values({
      trackingLinkId: link.id,
      ipHash: meta.ip ? createHash("sha256").update(`${IP_HASH_SALT}:${meta.ip}`).digest("hex") : null,
      userAgent: meta.userAgent,
      referrer: meta.referrer,
      country: meta.country,
    })
    .returning({ id: clicks.id });
  // Results, the campaign's analytics and the creator's own numbers all count
  // this row. A redirect is not a server action, so these expire rather than update.
  expireTags(tagsForMutation("tracking", { brandId: link.brandId, creatorId: link.creatorId, campaignId: link.campaignId }));
  return { kind: "ok", clickId: click.id, destination: link.destination, siteKey: link.siteKey };
}
