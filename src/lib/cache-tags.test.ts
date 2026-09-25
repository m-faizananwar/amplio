import { describe, expect, it } from "vitest";
import { tag, tagsForMutation, type CacheScope, type MutationKind } from "./cache-tags";

const B = "brand-1";
const C = "creator-1";
const K = "campaign-1";
const BRAND_USER = "user-brand";
const CREATOR_USER = "user-creator";
const BOTH: CacheScope = { brandId: B, creatorId: C, campaignId: K, userIds: [BRAND_USER, CREATOR_USER] };

// Every mutation the app performs, and the reads it must invalidate. A read
// that is cached but missing from this table shows up as stale data in the UI,
// so the table is the contract: change a query's tag, change a row here.
const EXPECTED: Record<MutationKind, string[]> = {
  booking: [
    tag.brandCollaborations(B), tag.brandOverview(B), tag.brandBilling(B), tag.brandCampaigns(B),
    tag.creatorCollaborations(C), tag.creatorOpportunities(C), tag.creatorOverview(C),
    tag.campaign(K), tag.viewer(BRAND_USER), tag.viewer(CREATOR_USER),
  ],
  "collaboration-status": [
    tag.brandCollaborations(B), tag.brandOverview(B), tag.brandBilling(B), tag.brandResults(B), tag.brandCampaigns(B),
    tag.creatorCollaborations(C), tag.creatorOpportunities(C), tag.creatorOverview(C), tag.creatorEarnings(C), tag.creatorAnalytics(C),
    tag.campaign(K), tag.viewer(BRAND_USER), tag.viewer(CREATOR_USER),
  ],
  message: [
    tag.brandMessages(B), tag.brandOverview(B), tag.creatorMessages(C), tag.creatorOverview(C),
    tag.viewer(BRAND_USER), tag.viewer(CREATOR_USER),
  ],
  shortlist: [tag.brandShortlist(B), tag.campaign(K)],
  campaign: [
    tag.brandCampaigns(B), tag.brandOverview(B), tag.brandCollaborations(B), tag.campaign(K),
    tag.viewer(BRAND_USER), tag.viewer(CREATOR_USER),
  ],
  "top-up": [tag.brandBilling(B), tag.brandOverview(B), tag.viewer(BRAND_USER), tag.viewer(CREATOR_USER)],
  withdraw: [tag.creatorEarnings(C), tag.creatorOverview(C), tag.viewer(BRAND_USER), tag.viewer(CREATOR_USER)],
  "brand-profile": [
    tag.brandSettings(B), tag.brandOverview(B), tag.brandCampaigns(B), tag.viewer(BRAND_USER), tag.viewer(CREATOR_USER),
  ],
  "creator-profile": [
    tag.creatorOverview(C), tag.creatorCard(C), tag.creatorEarnings(C), tag.creatorDirectory(),
    tag.viewer(BRAND_USER), tag.viewer(CREATOR_USER),
  ],
  tracking: [tag.brandResults(B), tag.brandOverview(B), tag.creatorAnalytics(C), tag.campaign(K)],
};

describe("tagsForMutation", () => {
  for (const [kind, expected] of Object.entries(EXPECTED) as Array<[MutationKind, string[]]>) {
    it(`${kind} invalidates exactly its reads`, () => {
      expect(tagsForMutation(kind, BOTH)).toEqual([...expected].sort());
    });
  }

  it("skips the side of a mutation it does not know", () => {
    expect(tagsForMutation("booking", { brandId: B })).toEqual(
      [tag.brandCollaborations(B), tag.brandOverview(B), tag.brandBilling(B), tag.brandCampaigns(B)].sort(),
    );
    expect(tagsForMutation("withdraw", {})).toEqual([]);
  });

  it("does not touch money surfaces from a click", () => {
    const tags = tagsForMutation("tracking", BOTH);
    expect(tags).not.toContain(tag.brandBilling(B));
    expect(tags).not.toContain(tag.viewer(BRAND_USER));
  });

  it("dedupes and sorts so callers can revalidate blindly", () => {
    const tags = tagsForMutation("collaboration-status", { ...BOTH, userIds: [BRAND_USER, BRAND_USER] });
    expect(new Set(tags).size).toBe(tags.length);
    expect(tags).toEqual([...tags].sort());
  });
});
