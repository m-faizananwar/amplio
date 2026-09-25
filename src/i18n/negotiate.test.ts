import { describe, expect, it } from "vitest";
import { pickLocale } from "./negotiate";

describe("pickLocale", () => {
  it("keeps the reader's choice over the browser", () => {
    expect(pickLocale("fr", "en-GB,en;q=0.9")).toBe("fr");
    expect(pickLocale("en", "fr-FR,fr;q=0.9")).toBe("en");
  });

  it("follows the browser on a first visit", () => {
    expect(pickLocale(undefined, "fr-CA,fr;q=0.9,en;q=0.8")).toBe("fr");
    expect(pickLocale(undefined, "de-DE,de;q=0.9,fr;q=0.7,en;q=0.8")).toBe("en");
    expect(pickLocale(undefined, "de, fr;q=0.5")).toBe("fr");
  });

  it("falls back to English", () => {
    expect(pickLocale(undefined, null)).toBe("en");
    expect(pickLocale("xx", "ja,zh;q=0.8")).toBe("en");
    expect(pickLocale(undefined, "fr;q=0")).toBe("en");
  });
});
