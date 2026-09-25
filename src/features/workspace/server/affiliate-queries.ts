import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, collaborations } from "@/db/schema";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

export type AffiliateSummary = {
  brandsIntroduced: number;
  brandsBooked: number;
  paidCollaborations: number;
  brands: Array<{ company: string; joinedAt: string; paidCollaborations: number }>;
};

// What the referral link has recorded: the brands that signed up through it
// and the paid collaborations they have run since. No reward is computed —
// the platform takes no fee in this build, so there is no commission to share
// (DECISIONS.md: the fee is €0).
async function loadAffiliateSummary(creatorId: string): Promise<AffiliateSummary> {
  const db = getDb();
  const referred = await db.select({ id: brands.id, company: brands.company, createdAt: brands.createdAt }).from(brands).where(eq(brands.referredByCreatorId, creatorId));
  if (referred.length === 0) return { brandsIntroduced: 0, brandsBooked: 0, paidCollaborations: 0, brands: [] };

  const paid = await db
    .select({ brandId: campaigns.brandId })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .where(and(inArray(campaigns.brandId, referred.map((b) => b.id)), eq(collaborations.status, "paid")));

  const rows = referred.map((b) => ({
    company: b.company,
    joinedAt: b.createdAt.toISOString(),
    paidCollaborations: paid.filter((p) => p.brandId === b.id).length,
  }));
  return {
    brandsIntroduced: rows.length,
    brandsBooked: rows.filter((r) => r.paidCollaborations > 0).length,
    paidCollaborations: paid.length,
    brands: rows,
  };
}

// Referral totals move with the creator's ledger.
export function getAffiliateSummary(creatorId: string) {
  return cachedRead(loadAffiliateSummary, ["affiliate-summary"], { tags: [tag.creatorEarnings(creatorId)] })(creatorId);
}
