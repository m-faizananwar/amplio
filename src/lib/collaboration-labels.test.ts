import { describe, expect, it } from "vitest";
import { COLLABORATION_STATUSES } from "./collaboration-status";
import { BRAND } from "@/config/brand";
import {
  BRAND_TABS,
  CREATOR_TABS,
  STATUS_LABELS,
  brandNextAction,
  brandTabFor,
  countByTab,
  creatorNextAction,
  creatorTabFor,
  timeLeftLabel,
} from "./collaboration-labels";

const HOUR = 3_600_000;
const NOW = new Date("2026-09-12T10:00:00Z").getTime();

describe("tab mapping", () => {
  it("puts every status in exactly one creator tab (docs/plan.md's table)", () => {
    expect(creatorTabFor("invited")).toBe("needs_action");
    expect(creatorTabFor("changes_requested")).toBe("needs_action");
    expect(creatorTabFor("approved")).toBe("needs_action");
    expect(creatorTabFor("applied")).toBe("applications_sent");
    expect(creatorTabFor("accepted")).toBe("active");
    expect(creatorTabFor("draft_submitted")).toBe("active");
    expect(creatorTabFor("scheduled")).toBe("active");
    expect(creatorTabFor("live")).toBe("active");
    expect(creatorTabFor("declined")).toBe("declined");
    expect(creatorTabFor("paid")).toBe("completed");
    for (const status of COLLABORATION_STATUSES) expect(CREATOR_TABS).toContain(creatorTabFor(status));
  });

  it("maps brand tabs, with declined only under All", () => {
    expect(brandTabFor("invited")).toBe("invitations_sent");
    expect(brandTabFor("applied")).toBe("invitations_received");
    expect(brandTabFor("draft_submitted")).toBe("to_do");
    expect(brandTabFor("paid")).toBe("completed");
    expect(brandTabFor("declined")).toBeNull();
    for (const status of ["accepted", "changes_requested", "approved", "scheduled", "live"] as const) {
      expect(brandTabFor(status)).toBe("active");
    }
  });

  it("counts per tab and everything under All", () => {
    const counts = countByTab(["invited", "applied", "declined", "paid", "live"], BRAND_TABS, brandTabFor);
    expect(counts).toEqual({ all: 5, active: 1, invitations_received: 1, invitations_sent: 1, to_do: 0, completed: 1 });
  });

  it("has a label for every status", () => {
    for (const status of COLLABORATION_STATUSES) expect(STATUS_LABELS[status]).toBeTruthy();
  });
});

describe("timeLeftLabel", () => {
  it("formats minutes, hours, days and expiry", () => {
    expect(timeLeftLabel(new Date(NOW + 20 * 60_000).toISOString(), NOW)).toBe("20m left");
    expect(timeLeftLabel(new Date(NOW + 36 * HOUR).toISOString(), NOW)).toBe("36h left");
    expect(timeLeftLabel(new Date(NOW + 72 * HOUR).toISOString(), NOW)).toBe("3d left");
    expect(timeLeftLabel(new Date(NOW - HOUR).toISOString(), NOW)).toBe("expired");
    expect(timeLeftLabel(null, NOW)).toBeNull();
  });
});

describe("next action", () => {
  const base = { acceptBy: null, revisionRound: 1, maxRevisionRounds: 2, now: NOW };

  it("tells the creator what to do per status", () => {
    expect(creatorNextAction({ ...base, status: "invited", acceptBy: new Date(NOW + 36 * HOUR).toISOString() })).toBe(
      "Accept or decline · 36h left",
    );
    expect(creatorNextAction({ ...base, status: "invited" })).toBe("Accept or decline");
    expect(creatorNextAction({ ...base, status: "accepted" })).toBe("Submit your draft");
    expect(creatorNextAction({ ...base, status: "changes_requested" })).toBe("Update your draft (round 1 of 2)");
    expect(creatorNextAction({ ...base, status: "approved" })).toBe("Schedule the post");
    expect(creatorNextAction({ ...base, status: "scheduled" })).toBe("Publish and add the post URL");
    expect(creatorNextAction({ ...base, status: "draft_submitted" })).toBe("Waiting for review");
    expect(creatorNextAction({ ...base, status: "live" })).toBe("Awaiting payment");
    expect(creatorNextAction({ ...base, status: "paid" })).toBe("Paid");
  });

  it("tells the brand what to do per status", () => {
    expect(brandNextAction({ ...base, status: "applied" })).toBe("Accept or decline the application");
    expect(brandNextAction({ ...base, status: "draft_submitted" })).toBe("Review the draft");
    expect(brandNextAction({ ...base, status: "live" })).toBe("Pay the creator");
    expect(brandNextAction({ ...base, status: "changes_requested" })).toBe("Creator is revising (round 1 of 2)");
  });

  it("covers every status on both sides", () => {
    for (const status of COLLABORATION_STATUSES) {
      expect(creatorNextAction({ ...base, status })).toBeTruthy();
      expect(brandNextAction({ ...base, status })).toBeTruthy();
    }
  });
});

describe("eventLabel", () => {
  it("names who did what, distinguishing invitation from application", async () => {
    const { eventLabel } = await import("./collaboration-labels");
    expect(eventLabel("accept", "creator", "invited")).toBe("The creator accepted the invitation");
    expect(eventLabel("accept", "brand", "applied")).toBe("The brand accepted the application");
    expect(eventLabel("pay", "system", "live")).toBe(`${BRAND.name} released the payment`);
    expect(eventLabel("request_changes", "brand", "draft_submitted")).toBe("The brand requested changes");
  });
});
