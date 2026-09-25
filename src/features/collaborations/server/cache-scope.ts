import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, collaborations, creators } from "@/db/schema";
import type { CacheScope } from "@/lib/cache-tags";

// A collaboration always has two sides, and a status change moves numbers on
// both: lists, overviews, money, and each owner's shell. One join answers who
// they are; the caller turns that into tags.
export async function collaborationScope(collaborationId: string): Promise<CacheScope> {
  const [row] = await getDb()
    .select({
      brandId: campaigns.brandId,
      campaignId: collaborations.campaignId,
      creatorId: collaborations.creatorId,
      brandUserId: brands.ownerUserId,
      creatorUserId: creators.userId,
    })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .where(eq(collaborations.id, collaborationId));
  if (!row) return {};
  return {
    brandId: row.brandId,
    creatorId: row.creatorId,
    campaignId: row.campaignId,
    userIds: [row.brandUserId, row.creatorUserId],
  };
}
