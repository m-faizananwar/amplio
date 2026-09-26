import { describe, expect, it } from "vitest";
import { describeFilters, SEARCH_DEFAULT, searchLimit } from "./filters";

describe("creator search filters", () => {
  it("names exactly the filters that were applied, nothing else", () => {
    expect(describeFilters({ countries: ["FR"], maxPriceEuros: 500 })).toEqual(["country FR", "≤ €500"]);
    // asked for France but the model passed no country: nothing claims it
    expect(describeFilters({ maxPriceEuros: 500 })).toEqual(["≤ €500"]);
    expect(describeFilters({})).toEqual([]);
  });

  it("honours the requested count", () => {
    expect(searchLimit({ limit: 3 })).toBe(3);
    expect(searchLimit({})).toBe(SEARCH_DEFAULT);
    expect(searchLimit({ limit: 99 })).toBe(10);
  });
});
