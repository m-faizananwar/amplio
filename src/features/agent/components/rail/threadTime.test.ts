import { describe, expect, it } from "vitest";
import { ago, minutesOf, sameDay, startedAt } from "./threadTime";

const NOW = new Date("2026-09-27T14:00:00Z").getTime();

describe("thread time labels", () => {
  it("says how long ago, in the reader's language", () => {
    expect(ago("2026-09-27T12:00:00Z", NOW, "en")).toMatch(/2\s?h/);
    expect(ago("2026-09-27T13:59:40Z", NOW, "en")).toMatch(/this minute|now/i);
    expect(ago("2026-09-25T14:00:00Z", NOW, "en")).toMatch(/2\s?d|2 days/);
  });
  it("rounds a call to whole minutes, at least one", () => {
    expect(minutesOf(20)).toBe(1);
    expect(minutesOf(250)).toBe(4);
  });
  it("knows today from earlier, and when a call began", () => {
    expect(sameDay("2026-09-27T09:00:00Z", NOW)).toBe(true);
    expect(sameDay("2026-09-26T09:00:00Z", NOW)).toBe(false);
    expect(startedAt("2026-09-27T14:04:00Z", 240).toISOString()).toBe("2026-09-27T14:00:00.000Z");
  });
});
