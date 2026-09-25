import { describe, expect, it } from "vitest";
import { FIT_WEIGHTS, fitScore, icpBuckets } from "./fit-score";

const campaign = {
  targetIndustries: ["B2B", "SaaS", "AI"],
  icpTitles: ["Founder / CEO of early-stage SaaS", "Head of Growth at a 10–50 person SaaS"],
};

describe("fitScore", () => {
  it("maps ICP titles to audience buckets", () => {
    expect(icpBuckets(campaign.icpTitles).sort()).toEqual(["Founders", "Marketing"]);
    expect(icpBuckets(["VP Sales", "CTO"]).sort()).toEqual(["Engineering", "Sales"]);
  });

  it("ranks a niche creator with the right audience above a big generalist", () => {
    const niche = fitScore(
      { industries: ["SaaS", "AI"], audienceJobTitles: { Founders: 45, Marketing: 20, Other: 35 }, followers: 2500, engagementRate: 0.06, postsPerMonth: 10 },
      campaign,
    );
    const generalist = fitScore(
      { industries: ["Creative", "Design"], audienceJobTitles: { Product: 50, Other: 50 }, followers: 120_000, engagementRate: 0.01, postsPerMonth: 3 },
      campaign,
    );
    expect(niche.score).toBeGreaterThan(80);
    expect(generalist.score).toBeLessThan(35);
    expect(niche.reason).toMatch(/Founders — your ICP/);
  });

  it("weights sum to one and every signal is 0..100", () => {
    expect(Object.values(FIT_WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    const result = fitScore(
      { industries: [], audienceJobTitles: {}, followers: 1000, engagementRate: 0, postsPerMonth: 0 },
      { targetIndustries: [], icpTitles: [] },
    );
    for (const s of result.signals) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    }
    expect(result.score).toBe(0);
  });
});

describe("engagement against our own creators", () => {
  const creator = { industries: ["SaaS"], audienceJobTitles: { Founders: 50, Other: 50 }, followers: 2_500, engagementRate: 0.06, postsPerMonth: 8 };
  const campaign = { targetIndustries: ["SaaS"], icpTitles: ["Founder"] };
  const engagement = (r: ReturnType<typeof fitScore>) => r.signals.find((s) => s.key === "engagement");

  it("compares with the median of the creator's own tier on Amplio", () => {
    const signal = engagement(fitScore(creator, campaign, { byTier: [0.04, 0.03, null, null, null], overall: 0.03 }));
    expect(signal?.score).toBe(100); // 1.5× the tier median
    expect(signal?.detail).toBe("6.0% engagement vs a 4.0% median for creators their size on Amplio");
  });

  it("falls back to the marketplace median when the tier is too thin", () => {
    const signal = engagement(fitScore(creator, campaign, { byTier: [null, null, null, null, null], overall: 0.06 }));
    expect(signal?.score).toBe(70);
    expect(signal?.detail).toContain("median on Amplio");
  });

  it("stays neutral, and says why, with nothing to compare against", () => {
    const signal = engagement(fitScore(creator, campaign));
    expect(signal?.score).toBe(70);
    expect(signal?.detail).toContain("nothing on Amplio to compare");
  });
});
