import { describe, expect, it } from "vitest";
import { formatCount, formatEuros, formatWholeEuros } from "./money";

// Intl uses narrow no-break spaces in French; compare with plain spaces.
const plain = (s: string) => s.replace(/[  ]/g, " ");

describe("formatWholeEuros", () => {
  it("reads the English way in English", () => {
    expect(formatWholeEuros(137_000, "en")).toBe("€1,370");
  });
  it("reads the French way in French", () => {
    expect(plain(formatWholeEuros(137_000, "fr"))).toBe("1 370 €");
  });
  it("drops the cents", () => {
    expect(formatWholeEuros(45_049, "en")).toBe("€450");
  });
});

describe("formatCount", () => {
  it("groups by locale", () => {
    expect(formatCount(12_186_746, "en")).toBe("12,186,746");
    expect(plain(formatCount(12_186_746, "fr"))).toBe("12 186 746");
  });
});

describe("formatEuros", () => {
  it("formats euros and cents in the reader's locale, never a fixed one", () => {
    expect(formatEuros(355_000, "en")).toBe("€3,550.00");
    expect(plain(formatEuros(355_000, "fr"))).toBe("3 550,00 €");
  });
});
