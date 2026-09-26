import { describe, expect, it } from "vitest";
import { COLLABORATION_STATUSES, TRANSITIONS } from "./collaboration-status";
import { countByFilter, filterFor, needsYou, ownerFor } from "./next-step";

describe("ownerFor", () => {
  it("gives each side exactly the statuses the state machine lets it move from", () => {
    for (const status of COLLABORATION_STATUSES) {
      for (const role of ["creator", "brand"] as const) {
        const canMove = TRANSITIONS.some((t) => t.from === status && t.actor === role);
        const owner = ownerFor(status, role);
        if (owner !== "done") expect(owner === "you", `${role} ${status}`).toBe(canMove);
      }
    }
  });

  it("marks terminal statuses as done for both sides", () => {
    for (const role of ["creator", "brand"] as const) {
      expect(ownerFor("paid", role)).toBe("done");
      expect(ownerFor("declined", role)).toBe("done");
    }
  });
});

describe("filterFor", () => {
  it("puts every status a side owns under needs_you", () => {
    for (const status of COLLABORATION_STATUSES) {
      for (const role of ["creator", "brand"] as const) {
        if (ownerFor(status, role) === "you") expect(filterFor(status, role)).toBe("needs_you");
      }
    }
  });

  it("counts every row exactly once", () => {
    expect(countByFilter(["invited", "applied", "live", "paid", "declined", "approved"], "creator")).toEqual({ needs_you: 2, waiting: 1, live: 1, done: 2 });
    expect(countByFilter(["invited", "applied", "live", "draft_submitted"], "brand")).toEqual({ needs_you: 3, waiting: 1, live: 0, done: 0 });
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
    expect(needsYou([], { availableCents: 4200, setupIncomplete: true }).map((i) => i.kind)).toEqual(["withdraw", "setup"]);
  });
});

// The Overview puts the ring beside the Needs-you list and the Collaborations
// tabs count the same groups: all three must agree on which collaborations
// need the creator, whatever mix of states they are in.
describe("the ring, the Needs-you list and the tabs agree", () => {
  it("counts the same collaborations as needing the creator", () => {
    const rows = COLLABORATION_STATUSES.map((status, i) => ({ id: `c${i}`, status, dueDate: null }));
    const listed = needsYou(rows, { availableCents: 0, setupIncomplete: false }).filter((item) => item.kind === "collaboration");
    const counted = countByFilter(rows.map((r) => r.status), "creator").needs_you;
    expect(listed.length).toBe(counted);
    expect(new Set(listed.map((item) => (item.kind === "collaboration" ? item.status : null)))).toEqual(
      new Set(COLLABORATION_STATUSES.filter((s) => filterFor(s, "creator") === "needs_you")),
    );
  });
});
