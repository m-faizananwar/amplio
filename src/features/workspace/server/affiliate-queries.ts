import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, collaborations } from "@/db/schema";
import { AFFILIATE_MONTHS, AFFILIATE_SHARE_PERCENT, PLATFORM_COMMISSION_PERCENT } from "../constants";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

const DAY_MS = 86_400_000;
const DAYS_PER_MONTH = 30;
const PERCENT = 100;

export type AffiliateSummary = {
  rewardsCents: number;
  brandsIntroduced: number;
  brandsRewarding: number;
  earningNow: number;
  brands: Array<{ company: string; joinedAt: string; paidCollaborations: number; rewardCents: number; windowEndsAt: string | null }>;
};

// Reward = the creator's share of naano's commission on every paid
// collaboration a referred brand completes during its three-month window,
// which starts at the brand's first completed paid campaign.
async function loadAffiliateSummary(creatorId: string): Promise<AffiliateSummary> {
  const db = getDb();
  const referred = await db.select({ id: brands.id, company: brands.company, createdAt: brands.createdAt }).from(brands).where(eq(brands.referredByCreatorId, creatorId));
  if (referred.length === 0) return { rewardsCents: 0, brandsIntroduced: 0, brandsRewarding: 0, earningNow: 0, brands: [] };

  const paid = await db
    .select({ brandId: campaigns.brandId, feeCents: collaborations.feeCents, paidAt: collaborations.paidAt })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .where(and(inArray(campaigns.brandId, referred.map((b) => b.id)), eq(collaborations.status, "paid")));

  const windowMs = AFFILIATE_MONTHS * DAYS_PER_MONTH * DAY_MS;
  const now = Date.now();
  const rows = referred.map((b) => {
    const theirs = paid.filter((p) => p.brandId === b.id && p.paidAt).sort((a, b2) => (a.paidAt?.getTime() ?? 0) - (b2.paidAt?.getTime() ?? 0));
    const first = theirs[0]?.paidAt ?? null;
    const windowEnd = first ? first.getTime() + windowMs : null;
    const inWindow = theirs.filter((p) => windowEnd !== null && (p.paidAt?.getTime() ?? 0) <= windowEnd);
    const commission = inWindow.reduce((sum, p) => sum + p.feeCents, 0) * (PLATFORM_COMMISSION_PERCENT / PERCENT);
    return {
      company: b.company,
      joinedAt: b.createdAt.toISOString(),
      paidCollaborations: theirs.length,
      rewardCents: Math.round(commission * (AFFILIATE_SHARE_PERCENT / PERCENT)),
      windowEndsAt: windowEnd ? new Date(windowEnd).toISOString() : null,
      earning: windowEnd !== null && windowEnd > now,
    };
  });
  return {
    rewardsCents: rows.reduce((sum, r) => sum + r.rewardCents, 0),
    brandsIntroduced: rows.length,
    brandsRewarding: rows.filter((r) => r.rewardCents > 0).length,
    earningNow: rows.filter((r) => r.earning).length,
    brands: rows.map(({ earning: _earning, ...rest }) => rest),
  };
}

// Referral totals move with the creator's ledger.
export function getAffiliateSummary(creatorId: string) {
  return cachedRead(loadAffiliateSummary, ["affiliate-summary"], { tags: [tag.creatorEarnings(creatorId)] })(creatorId);
}
