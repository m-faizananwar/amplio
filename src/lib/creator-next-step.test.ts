import { describe, expect, it } from "vitest";
import { COLLABORATION_STATUSES, TRANSITIONS } from "./collaboration-status";
import { countByFilter, creatorFilterFor, needsYou, ownerOf } from "./creator-next-step";

describe("ownerOf", () => {
  it("gives the creator exactly the statuses where the state machine lets the creator move", () => {
    for (const status of COLLABORATION_STATUSES) {
      const creatorCanMove = TRANSITIONS.some((t) => t.from === status && t.actor === "creator");
      expect(ownerOf(status) === "you", status).toBe(creatorCanMove);
    }
  });

  it("marks terminal statuses as done", () => {
    expect(ownerOf("paid")).toBe("done");
    expect(ownerOf("declined")).toBe("done");
  });
});

describe("creatorFilterFor", () => {
  it("puts every status the creator owns under needs_you", () => {
    for (const status of COLLABORATION_STATUSES) {
      if (ownerOf(status) === "you") expect(creatorFilterFor(status)).toBe("needs_you");
    }
  });

  it("counts every row exactly once", () => {
    const counts = countByFilter(["invited", "applied", "live", "paid", "declined", "approved"]);
    expect(counts).toEqual({ needs_you: 2, waiting: 1, live: 1, done: 2 });
  });
});

describe("needsYou", () => {
  const rows = [
    { id: "a", status: "accepted" as const, dueDate: "2026-10-01" },
    { id: "b", status: "invited" as const, dueDate: "2026-10-09" },
    { id: "c", status: "invited" as const, dueDate: "2026-10-02" },
    { id: "d", status: "live" as const, dueDate: null },
    { id: "e", status: "changes_requested" as const, dueDate: null },
  ];

  it("orders by urgency, then by due date, and leaves out rows the brand owns", () => {
    const ids = needsYou(rows, { availableCents: 0, setupIncomplete: false }).map((i) => (i.kind === "collaboration" ? i.id : i.kind));
    expect(ids).toEqual(["c", "b", "e", "a"]);
  });

  it("adds money to withdraw and an unfinished card after the collaborations", () => {
    const kinds = needsYou([], { availableCents: 4200, setupIncomplete: true }).map((i) => i.kind);
    expect(kinds).toEqual(["withdraw", "setup"]);
  });

  it("is empty when nothing waits on the creator", () => {
    expect(needsYou([{ id: "x", status: "paid", dueDate: null }], { availableCents: 0, setupIncomplete: false })).toEqual([]);
  });
});
