import { describe, expect, it } from "vitest";
import { PRICE_CAP_CENTS, PRICE_FLOOR_CENTS, engagementFactor, industryFactor, recommendPrice } from "./recommend-price";

const ANCHOR_INDUSTRIES = ["AI", "SaaS", "Productivity"];

describe("recommendPrice", () => {
  it("reproduces the observed recommendation at the anchor", () => {
    expect(recommendPrice(2070, ANCHOR_INDUSTRIES, 0.05)).toBe(31_500);
    // the demo creator (2,070 followers, 4.29% engagement) sits inside the normal band
    expect(recommendPrice(2070, ANCHOR_INDUSTRIES, 0.0429)).toBe(31_500);
    // engagement unknown → treated as normal
    expect(recommendPrice(2070, ANCHOR_INDUSTRIES)).toBe(31_500);
  });

  it("floors at €20 and caps at €1,500", () => {
    expect(recommendPrice(0, [])).toBe(PRICE_FLOOR_CENTS);
    expect(recommendPrice(5, [])).toBe(PRICE_FLOOR_CENTS);
    expect(recommendPrice(5_000_000, ANCHOR_INDUSTRIES, 0.2)).toBe(PRICE_CAP_CENTS);
    expect(recommendPrice(Number.NaN, [])).toBe(PRICE_FLOOR_CENTS);
  });

  it("grows with followers, sub-linearly, in €5 steps", () => {
    const small = recommendPrice(1_000, ["Marketing"]);
    const mid = recommendPrice(10_000, ["Marketing"]);
    const big = recommendPrice(100_000, ["Marketing"]);
    expect(small).toBeLessThan(mid);
    expect(mid).toBeLessThan(big);
    expect(big / small).toBeLessThan(100);
    for (const cents of [small, mid, big]) expect(cents % 500).toBe(0);
  });

  it("charges more for premium verticals than for standard ones", () => {
    expect(industryFactor(["AI", "SaaS"])).toBeCloseTo(1.1);
    expect(industryFactor(["Marketing", "HR"])).toBe(1);
    expect(industryFactor([])).toBe(1);
    expect(recommendPrice(5_000, ["AI", "Fintech"])).toBeGreaterThan(recommendPrice(5_000, ["Marketing", "HR"]));
  });

  it("only moves the price when engagement is clearly outside the normal band", () => {
    expect(engagementFactor(2_000, 0.045)).toBe(1);
    expect(engagementFactor(2_000, 0.06)).toBe(1);
    expect(engagementFactor(2_000, 0.12)).toBeGreaterThan(1);
    expect(engagementFactor(2_000, 0.01)).toBeLessThan(1);
    expect(engagementFactor(2_000, 1)).toBe(1.4);
    expect(engagementFactor(2_000, 0.0001)).toBe(0.7);
    expect(engagementFactor(2_000, 0)).toBe(1);
  });
});
