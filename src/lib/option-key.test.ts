import { describe, expect, it } from "vitest";
import { optionKey } from "./option-key";

describe("optionKey", () => {
  it("turns labels into message keys", () => {
    expect(optionKey("Growth / GTM")).toBe("growth_gtm");
    expect(optionKey("E-commerce")).toBe("e_commerce");
    expect(optionKey("Real Estate / PropTech")).toBe("real_estate_proptech");
  });
});
