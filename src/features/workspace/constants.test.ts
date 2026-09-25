import { describe, expect, it } from "vitest";
import { optionKey } from "@/lib/option-key";
import { INDUSTRIES, REGIONS } from "./constants";

// Labels are looked up by optionKey, so two values sharing a key would show
// the same label.
describe("option lists", () => {
  it("give every industry and region its own message key", () => {
    for (const list of [INDUSTRIES, REGIONS]) expect(new Set(list.map(optionKey)).size).toBe(list.length);
  });
});
