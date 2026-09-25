import { describe, expect, it } from "vitest";
import { brandTrail } from "./brand-trail";

describe("brandTrail", () => {
  it("draws the same trail for the same brand, whatever the case or spacing", () => {
    expect(brandTrail("Orbit Labs")).toEqual(brandTrail("  orbit labs "));
  });

  it("gives different brands different trails", () => {
    const names = ["Orbit Labs", "Zapier", "Pipedrive", "Notion", "Lemlist", "Qonto", "Alan", "Swile"];
    const shapes = new Set(names.map((n) => brandTrail(n).d));
    expect(shapes.size).toBeGreaterThanOrEqual(names.length - 1);
  });

  it("runs left to right in three or four dots and always bends", () => {
    for (const name of ["A", "Orbit Labs", "Zapier", "", "Été Studio"]) {
      const { points } = brandTrail(name);
      expect([3, 4]).toContain(points.length);
      for (let i = 1; i < points.length; i++) {
        expect(points[i][0]).toBeGreaterThan(points[i - 1][0]);
        expect(points[i][1]).not.toBe(points[i - 1][1]);
      }
    }
  });
});
