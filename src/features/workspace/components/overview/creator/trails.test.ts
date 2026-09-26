import { describe, expect, it } from "vitest";
import type { LedgerRowDto } from "@/features/payouts/schemas";
import type { CreatorClickRow } from "@/features/tracking/server/creator-queries";
import { clicksPerDay, earnedPerMonth } from "./trails";

const now = new Date("2026-09-26T12:00:00Z");
const click = (at: string) => ({ id: at, at, collaborationId: "c", campaign: "x", brand: "y", referrer: null, device: "desktop", country: null }) as CreatorClickRow;

describe("clicksPerDay", () => {
  it("counts the last n days, oldest first, quiet days at zero", () => {
    const series = clicksPerDay([click("2026-09-26T08:00:00Z"), click("2026-09-26T09:00:00Z"), click("2026-09-24T10:00:00Z"), click("2026-08-01T10:00:00Z")], 3, now);
    expect(series).toEqual([{ day: "2026-09-24", count: 1 }, { day: "2026-09-25", count: 0 }, { day: "2026-09-26", count: 2 }]);
  });
});

describe("earnedPerMonth", () => {
  it("sums released payouts per month and ignores pending ones and withdrawals", () => {
    const row = (date: string, amountCents: number, kind: { type?: string; status?: string } = {}) => ({ id: date, date, amountCents, type: kind.type ?? "payout", status: kind.status ?? "completed" }) as unknown as LedgerRowDto;
    const series = earnedPerMonth([row("2026-09-02", 31_500), row("2026-09-20", 10_000), row("2026-08-10", 5_000, { status: "pending" }), row("2026-07-29", 31_500), row("2026-09-15", -20_000, { type: "withdrawal" })], 3, now);
    expect(series).toEqual([{ month: "2026-07", cents: 31_500 }, { month: "2026-08", cents: 0 }, { month: "2026-09", cents: 41_500 }]);
  });
});
