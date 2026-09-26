import { describe, expect, it } from "vitest";
import { speakable, speechFor } from "./speech";
import { decideSpoken } from "./voice-rule";

describe("confirm by voice", () => {
  it("a yes settles only the card pending for this thread", () => {
    expect(decideSpoken("yes, book them", "pa_1")).toEqual({ kind: "confirm", id: "pa_1" });
    expect(decideSpoken("Oui, vas-y", "pa_1")).toEqual({ kind: "confirm", id: "pa_1" });
  });

  it("a bare yes with nothing pending answers nothing; a real request is a turn", () => {
    expect(decideSpoken("yes", null)).toEqual({ kind: "nothing" });
    expect(decideSpoken("yes, find me creators in Spain", null)).toEqual({ kind: "turn" });
  });

  it("anything that isn't yes or no keeps the card pending", () => {
    expect(decideSpoken("what's my wallet?", "pa_1")).toEqual({ kind: "turn" });
    expect(decideSpoken("yesterday's results", "pa_1")).toEqual({ kind: "turn" });
  });

  it("no cancels it", () => {
    expect(decideSpoken("no, not now", "pa_1")).toEqual({ kind: "cancel", id: "pa_1" });
  });
});

describe("what a call says", () => {
  it("never reads ids, links or markdown, and keeps it to two sentences", () => {
    const out = speakable("**Done.** I booked Randy 21b12626-7a2e-4abd-a975-ae2df290a8b8, see https://x.test/a. Next they reply. Then you review.", "en");
    expect(out).toBe("Done. I booked Randy, see.");
  });

  it("never reads Markdown aloud: list items become sentences, marks and links go", () => {
    expect(speakable("Here are two:\n- **Zune creator brief** by Zune\n- *HubSpot creator brief*\n", "en", 5)).toBe("Here are two: Zune creator brief by Zune. HubSpot creator brief.");
    expect(speakable("* **Zune creator brief** by Zune: €315.00 * **Stripe brief**: `new`", "en")).toBe("Zune creator brief by Zune: 315 euros Stripe brief: new.");
    expect(speakable("1. Launch it\n2. Edit the brief", "en")).toBe("Launch it. Edit the brief.");
    expect(speakable("See [the brief](/brand/campaigns/x) ~~now~~.", "en")).toBe("See the brief now.");
    expect(speakable("## Results\n> 640 clicks", "en")).toBe("Results 640 clicks");
  });

  it("says amounts as a voice would", () => {
    expect(speakable("€615.00 is held.", "en")).toBe("615 euros is held.");
    expect(speakable("Your wallet has €3,550.00.", "en")).toBe("Your wallet has 3,550 euros.");
    expect(speakable("4 685,00 € restent.", "fr")).toBe("4685 euros restent.");
  });

  it("chips attached to a reply don't replace it on a call", () => {
    const text = speechFor([{ type: "message", id: "m", text: "Q4 is still a draft, so it has no results yet.", final: true }, { type: "question", text: "", chips: ["Launch it", "Edit the brief"] }], "en");
    expect(text).toBe("Q4 is still a draft, so it has no results yet.");
  });

  it("reads a confirm card and asks", () => {
    const text = speechFor([{ type: "confirm", id: "pa_1", title: "Book 3 creators for Zune", facts: [{ label: "Held from your wallet", value: "€615.00", cents: 61_500 }], confirmLabel: "Book them", cancelLabel: "Not now", expiresAt: "x" }], "en");
    expect(text).toBe("Book 3 creators for Zune. Held from your wallet: 615 euros. Shall I go ahead?");
  });
});

describe("made-up ids", () => {
  it("flags an id argument that isn't a uuid", async () => {
    const { inventedIds } = await import("./id-guard");
    expect(inventedIds({ campaignId: "zune-q4", creatorIds: ["21b12626-7a2e-4abd-a975-ae2df290a8b8"] })).toEqual(["campaignId"]);
    expect(inventedIds({ creatorIds: ["c1"] })).toEqual(["creatorIds"]);
    expect(inventedIds({ campaignId: "21b12626-7a2e-4abd-a975-ae2df290a8b8", page: "billing" })).toEqual([]);
  });
});
