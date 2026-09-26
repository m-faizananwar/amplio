import { describe, expect, it } from "vitest";
import { describeFilters, emptySearchReason } from "./filters";

const base = { total: 5, scanned: 5, already: 5, belowFollowers: 0, minFollowers: 0, applied: ["country FR", "industry SaaS"], locale: "en" as const };

describe("why a search shows nobody", () => {
  it("says it from the search's own counts", () => {
    expect(emptySearchReason(base)).toBe("5 match, but all are already on this campaign.");
    expect(emptySearchReason({ ...base, total: 0, scanned: 0, already: 0 })).toBe("No creators match country FR · industry SaaS.");
    expect(emptySearchReason({ ...base, already: 0, belowFollowers: 5, minFollowers: 5000 })).toBe("5 match, but none has at least 5000 followers.");
    expect(emptySearchReason({ ...base, already: 3, belowFollowers: 2, minFollowers: 5000 })).toBe("5 match, but 3 are already on this campaign and the rest have fewer than 5000 followers.");
  });

  it("only claims what it scanned", () => {
    expect(emptySearchReason({ ...base, total: 300, scanned: 120, already: 120 })).toBe("The top 120 of 300 matches, but all are already on this campaign.");
  });

  it("in French, with French filter words", () => {
    expect(emptySearchReason({ ...base, locale: "fr" })).toBe("5 correspondent, mais tous sont déjà sur cette campagne.");
    const applied = describeFilters({ countries: ["FR"], maxPriceEuros: 200 }, "fr");
    expect(emptySearchReason({ ...base, total: 0, scanned: 0, already: 0, applied, locale: "fr" })).toBe("Aucun créateur ne correspond à pays FR · ≤ 200 €.");
  });
});
