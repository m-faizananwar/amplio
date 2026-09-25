import { describe, expect, it } from "vitest";
import { TRANSITIONS } from "./collaboration-status";
import { timelineKey } from "./timeline-key";

describe("timelineKey", () => {
  it("tells apart the same event reached from different places", () => {
    expect(timelineKey("accept", "creator", "invited")).toBe("acceptInvitation");
    expect(timelineKey("accept", "brand", "applied")).toBe("acceptApplication");
    expect(timelineKey("submit_draft", "creator", "accepted")).toBe("submitDraft");
    expect(timelineKey("submit_draft", "creator", "changes_requested")).toBe("resubmitDraft");
    expect(timelineKey("pay", "system", "live")).toBe("paySystem");
    expect(timelineKey("pay", "brand", "live")).toBe("payBrand");
  });

  it("has a sentence for every allowed transition", () => {
    for (const t of TRANSITIONS) expect(timelineKey(t.event, t.actor, t.from), `${t.event} from ${t.from}`).not.toBe("unknown");
  });
});
