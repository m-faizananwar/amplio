import { describe, expect, it } from "vitest";
import { noteKey, planNote, redundantNotes } from "./note-plan";

describe("saving a preference", () => {
  it("the same thing written differently is the same note", () => {
    expect(noteKey("Budget €2k a month")).toBe(noteKey("budget 2,000 euros per month"));
    expect(noteKey("Only  French creators.")).toBe(noteKey("only french creators"));
    expect(planNote("only French creators", [{ id: "a", text: "Only French creators." }])).toEqual({ action: "skip" });
  });

  it("a new monthly budget replaces the old one; a total budget is a different thing", () => {
    const existing = [{ id: "m", text: "budget €2k a month" }, { id: "f", text: "only French creators" }, { id: "t", text: "budget €5,000 total" }];
    expect(planNote("budget €3k a month", existing)).toEqual({ action: "insert", replace: ["m"] });
    expect(planNote("budget €9,000 total", existing)).toEqual({ action: "insert", replace: ["t"] });
  });

  it("anything else is simply added", () => {
    expect(planNote("no crypto brands", [{ id: "f", text: "only French creators" }])).toEqual({ action: "insert", replace: [] });
  });

  it("cleans a list down to one of each, the newest budget of each kind", () => {
    const newestFirst = [
      { id: "1", text: "budget €3k a month" }, { id: "2", text: "only French creators" },
      { id: "3", text: "budget €2k a month" }, { id: "4", text: "Only French creators" }, { id: "5", text: "budget 2k per month" },
    ];
    expect(redundantNotes(newestFirst)).toEqual(["3", "4", "5"]);
  });
});
