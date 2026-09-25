import { describe, expect, it } from "vitest";
import { profileSource } from "./profile-source";

describe("profileSource", () => {
  it("calls seeded creators demo data, whatever their figures", () => {
    expect(profileSource({ seeded: true, followers: 12_000 })).toBe("demo");
    expect(profileSource({ seeded: true, followers: 0 })).toBe("demo");
  });

  it("calls followers imported and none entered by hand", () => {
    expect(profileSource({ seeded: false, followers: 2_070 })).toBe("imported");
    expect(profileSource({ seeded: false, followers: 0 })).toBe("manual");
  });
});
