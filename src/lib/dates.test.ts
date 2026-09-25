import { describe, expect, it } from "vitest";
import { daysUntil, formatDay, toDateInputValue } from "./dates";

describe("dates", () => {
  it("formats day, short month, year", () => {
    expect(formatDay("2026-09-12T10:00:00.000Z")).toBe("12 Sept 2026");
    expect(formatDay(null)).toBe("—");
  });
  it("feeds date inputs and counts days", () => {
    expect(toDateInputValue("2026-09-12T10:00:00.000Z")).toBe("2026-09-12");
    expect(daysUntil("2026-09-14T00:00:00.000Z", Date.UTC(2026, 8, 12))).toBe(2);
    expect(daysUntil(null)).toBeNull();
  });
});
