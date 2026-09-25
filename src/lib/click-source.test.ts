import { describe, expect, it } from "vitest";
import { deviceOf, referrerHost } from "./click-source";

describe("deviceOf", () => {
  it("reads the common families", () => {
    expect(deviceOf("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1")).toBe("mobile");
    expect(deviceOf("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile Safari/537.36")).toBe("mobile");
    expect(deviceOf("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(deviceOf("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Chrome/120 Safari/537.36")).toBe("desktop");
    expect(deviceOf("LinkedInBot/1.0 (compatible; Mozilla/5.0)")).toBe("bot");
    expect(deviceOf(null)).toBe("unknown");
  });
});

describe("referrerHost", () => {
  it("keeps the host without www", () => {
    expect(referrerHost("https://www.linkedin.com/feed/")).toBe("linkedin.com");
    expect(referrerHost("https://lnkd.in/abc")).toBe("lnkd.in");
  });

  it("returns null for a missing or broken referrer", () => {
    expect(referrerHost(null)).toBeNull();
    expect(referrerHost("not a url")).toBeNull();
  });
});
