import { describe, expect, it } from "vitest";
import { isSeededEmail } from "./seeded";

describe("isSeededEmail", () => {
  const demo = ["demo.amplio.app"];
  it("recognises the seed's reserved addresses", () => {
    expect(isSeededEmail("maya@example.com", demo)).toBe(true);
    expect(isSeededEmail("lea@premiuminboxes.example", demo)).toBe(true);
    expect(isSeededEmail("creator@demo.amplio.app", demo)).toBe(true);
  });
  it("leaves real addresses alone", () => {
    expect(isSeededEmail("maya@gmail.com", demo)).toBe(false);
    expect(isSeededEmail("ops@example.co", demo)).toBe(false);
  });
});
