import { describe, expect, it } from "vitest";
import { isAppPath, SPOKEN_YES } from "./callTypes";
import { formatDuration } from "./widget/CallTimer";

describe("isAppPath", () => {
  it("lets the agent open this app's own pages", () => {
    expect(isAppPath("/brand/creators?q=Randy")).toBe(true);
    expect(isAppPath("/creator/collaborations/abc-123")).toBe(true);
    expect(isAppPath("/brand")).toBe(true);
  });
  it("refuses anything that could leave the app or climb out of it", () => {
    expect(isAppPath("https://example.com")).toBe(false);
    expect(isAppPath("//example.com/brand")).toBe(false);
    expect(isAppPath("/brand/../api/agent")).toBe(false);
    expect(isAppPath("/api/agent")).toBe(false);
    expect(isAppPath("/brandx")).toBe(false);
  });
});

describe("SPOKEN_YES", () => {
  it("hears a yes in either language, and nothing else", () => {
    for (const yes of ["yes", "Yeah go ahead", "oui", "d’accord", "OK book them"]) expect(SPOKEN_YES.test(yes)).toBe(true);
    for (const no of ["no", "not yet", "yesterday I said", "non"]) expect(SPOKEN_YES.test(no)).toBe(false);
  });
});

describe("formatDuration", () => {
  it("reads mm:ss", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(65_400)).toBe("01:05");
    expect(formatDuration(-5)).toBe("00:00");
  });
});
