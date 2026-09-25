import { describe, expect, it } from "vitest";
import { INDUSTRIES, REGIONS } from "@/features/workspace/constants";
import { optionKey } from "./option-key";

describe("optionKey", () => {
  it("turns labels into message keys", () => {
    expect(optionKey("Growth / GTM")).toBe("growth_gtm");
    expect(optionKey("E-commerce")).toBe("e_commerce");
    expect(optionKey("Real Estate / PropTech")).toBe("real_estate_proptech");
  });

  it("gives every industry and region its own key", () => {
    for (const list of [INDUSTRIES, REGIONS]) expect(new Set(list.map(optionKey)).size).toBe(list.length);
  });
});
