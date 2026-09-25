import { describe, expect, it } from "vitest";
import { MIN_CLICKS_FOR_LEADS, MIN_LIVE_POSTS, estimate, ratesFrom, type ObservedSample } from "./estimator";

const CREATORS = [
  { followers: 4_000, medianViews: 2_000, priceCents: 40_000 },
  { followers: 12_000, medianViews: 6_000, priceCents: 60_000 },
  { followers: 800, medianViews: 0, priceCents: 20_000 },
];

const SAMPLE: ObservedSample = { livePosts: 10, views: 50_000, clicks: 1_000, signups: 50 };

describe("estimator (our own data)", () => {
  it("derives both rates from what went live", () => {
    expect(ratesFrom(SAMPLE)).toEqual({ clickRate: 0.02, leadRate: 0.05 });
  });

  it("projects the selection with those rates; creators without reach add spend, not clicks", () => {
    const e = estimate(CREATORS, SAMPLE);
    expect(e.creatorsWithReach).toBe(2);
    expect(e.totalSpendCents).toBe(120_000);
    expect(e.estClicks).toBe(160); // 8,000 views × 2%
    expect(e.estLeads).toBe(8); // 160 × 5%
    expect(e.estCpcCents).toBe(750);
    expect(e.estCplCents).toBe(15_000);
    expect(e.confidence).toBe("medium");
    expect(e.sample).toEqual(SAMPLE);
  });

  it("says nothing about clicks below the minimum sample", () => {
    const e = estimate(CREATORS, { livePosts: MIN_LIVE_POSTS - 1, views: 9_000, clicks: 400, signups: 20 });
    expect(e.clickRate).toBeNull();
    expect(e.estClicks).toBeNull();
    expect(e.estLeads).toBeNull();
    expect(e.estCpcCents).toBeNull();
    expect(e.confidence).toBeNull();
    expect(e.totalSpendCents).toBe(120_000);
  });

  it("gives clicks but not leads when too few clicks have been seen", () => {
    const e = estimate(CREATORS, { livePosts: 4, views: 10_000, clicks: MIN_CLICKS_FOR_LEADS - 1, signups: 3 });
    expect(e.estClicks).not.toBeNull();
    expect(e.leadRate).toBeNull();
    expect(e.estLeads).toBeNull();
    expect(e.estCplCents).toBeNull();
    expect(e.confidence).toBe("low");
  });

  it("an empty marketplace estimates nothing and does not divide by zero", () => {
    const e = estimate(CREATORS, { livePosts: 0, views: 0, clicks: 0, signups: 0 });
    expect([e.estClicks, e.estLeads, e.estCpcCents, e.estCplCents, e.confidence]).toEqual([null, null, null, null, null]);
  });
});
