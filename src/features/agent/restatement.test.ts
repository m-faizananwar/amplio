import { describe, expect, it } from "vitest";
import { dropRestatement } from "./restatement";

const names = ["Ethyl Kertzmann", "Esmeralda Bergnaum", "Tom Bechtelar", "Althea Altenwerth"];

describe("a reply under a result card", () => {
  it("doesn't restate the card's rows run together on one line", () => {
    const reply = "Four collaborations need you this week: - Ethyl Kertzmann for Zune creator brief has status Applied and is waiting for your move. - Esmeralda Bergnaum sent a draft. - Tom Bechtelar is live. - Althea Altenwerth is live.";
    expect(dropRestatement(reply, names)).toBe("Four collaborations need you this week.");
  });

  it("doesn't restate them as a list either", () => {
    const reply = "Here they are:\n- **Ethyl Kertzmann**: applied\n- **Esmeralda Bergnaum**: draft to review\n\nStart with the draft.";
    expect(dropRestatement(reply, names)).toBe("Here they are. Start with the draft.");
  });

  it("doesn't restate them as prose either", () => {
    const reply = "Four collaborations need your attention: **Ethyl Kertzmann** has applied, **Esmeralda Bergnaum** sent a draft, and Tom Bechtelar and Althea Altenwerth have live posts. Start with Esmeralda Bergnaum's draft.";
    expect(dropRestatement(reply, names)).toBe("Start with Esmeralda Bergnaum's draft.");
  });

  it("keeps what the card doesn't say, including one pointed mention", () => {
    const reply = "Four need you: two to review, two live posts to check. Start with Esmeralda Bergnaum's draft.";
    expect(dropRestatement(reply, names)).toBe(reply);
  });

  it("leaves a reply alone when no card was shown", () => {
    const reply = "- Ethyl Kertzmann\n- Esmeralda Bergnaum";
    expect(dropRestatement(reply, [])).toBe(reply);
  });
});
