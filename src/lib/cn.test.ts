import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("keeps a colour next to a ledger font size", () => {
    expect(cn("bg-ink text-paper", "h-9 text-body")).toBe("bg-ink text-paper h-9 text-body");
    expect(cn("text-failure", "text-small")).toBe("text-failure text-small");
  });

  it("still lets a later size or colour win over an earlier one", () => {
    expect(cn("text-body", "text-caption")).toBe("text-caption");
    expect(cn("text-ink", "text-money")).toBe("text-money");
    expect(cn("rounded-card", "rounded-control")).toBe("rounded-control");
  });
});
