import { describe, expect, it } from "vitest";
import { normalizeLinkedinUrl } from "./linkedin-url";

describe("normalizeLinkedinUrl", () => {
  it("reduces every spelling of a profile to one URL", () => {
    const want = "https://www.linkedin.com/in/jane-doe";
    for (const url of ["https://www.linkedin.com/in/jane-doe/", "linkedin.com/in/Jane-Doe", "https://fr.linkedin.com/in/jane-doe?utm_source=x", "http://linkedin.com/in/jane-doe#about"]) {
      expect(normalizeLinkedinUrl(url)).toBe(want);
    }
  });
  it("keeps encoded slugs readable", () => {
    expect(normalizeLinkedinUrl("https://www.linkedin.com/in/j%C3%A9r%C3%B4me")).toBe("https://www.linkedin.com/in/jérôme");
  });
  it("leaves anything that isn't a profile URL as typed", () => {
    expect(normalizeLinkedinUrl("  https://example.com/me  ")).toBe("https://example.com/me");
  });
});
