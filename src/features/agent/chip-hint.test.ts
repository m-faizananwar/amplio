import { describe, expect, it } from "vitest";
import { withChipHint } from "./chip-hint";

const hints = { "Launch it": 'Call openPage with campaignId 21b12626-7a2e-4abd-a975-ae2df290a8b8 and section "launch".', "Edit the brief": "Call openPage … brief." };

describe("replying with a chip", () => {
  it("a tapped, typed or spoken chip reaches the model with what it means", () => {
    expect(withChipHint("Launch it", hints)).toContain('section "launch"');
    expect(withChipHint("launch it.", hints)).toContain('section "launch"');
  });

  it("anything else goes through untouched", () => {
    expect(withChipHint("launch it next week and book three creators", hints)).toBe("launch it next week and book three creators");
    expect(withChipHint("Launch it", null)).toBe("Launch it");
  });
});
