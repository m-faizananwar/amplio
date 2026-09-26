import { describe, expect, it } from "vitest";
import { COLLAB_DEFAULT, pickCollaborations } from "./collab-list";

// most recent first, as the queries return them
const rows = Array.from({ length: 12 }, (_, i) => ({ id: `c${i}`, campaignName: "Zune creator brief", creatorName: `Creator ${i}`, status: i % 3 === 0 ? ("paid" as const) : ("invited" as const), feeCents: 1000 * (i + 1) }));
const pick = (limit?: unknown, filter?: unknown) => pickCollaborations(rows, { role: "brand", limit, filter, counterpart: (c) => c.creatorName });

describe("listing collaborations", () => {
  it("returns exactly the number asked for, most recent first, and the total", () => {
    const out = pick(4);
    expect(out.items.map((c) => c.id)).toEqual(["c0", "c1", "c2", "c3"]);
    expect(out.total).toBe(12);
  });

  it("applies the filter before the count", () => {
    const out = pick(2, "done");
    expect(out.items.every((c) => c.status === "paid")).toBe(true);
    expect(out.items).toHaveLength(2);
  });

  it("defaults sensibly and never returns more than the cap", () => {
    expect(pick().items).toHaveLength(COLLAB_DEFAULT);
    expect(pick(99).items).toHaveLength(12);
    expect(pick(0).items).toHaveLength(1);
  });
});
