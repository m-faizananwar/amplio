import type { TrailRow } from "@/components/trail/types";
import type { CollaborationDto } from "@/features/collaborations/schemas";
import type { LedgerRowDto } from "@/features/payouts/schemas";
import type { CreatorClickRow } from "@/features/tracking/server/creator-queries";

type T = (key: string) => string;
const DEVICE_KEY = { desktop: "deviceDesktop", mobile: "deviceMobile", tablet: "deviceTablet", bot: "deviceUnknown", unknown: "deviceUnknown" } as const;
const LIVE = new Set(["live", "paid"]);

// The rows behind each Overview number, in the TrailDrawer's shape. `t` is
// creator.trail.values, so "direct" and device names read in the viewer's language.
export function clickRows(clicks: CreatorClickRow[], t: T): TrailRow[] {
  return clicks.map((c) => ({
    id: c.id,
    at: c.at,
    title: `${c.campaign} · ${c.brand}`,
    detail: `${c.referrer ?? t("referrerDirect")} · ${t(DEVICE_KEY[c.device])}`,
    href: `/creator/collaborations/${c.collaborationId}`,
  }));
}

// Only released payouts: the total counts completed ones, so the rows must too.
export function earnedRows(ledger: LedgerRowDto[]): TrailRow[] {
  return ledger
    .filter((r) => r.type === "payout" && r.status === "completed")
    .map((r) => ({ id: r.id, at: r.date, title: r.description, detail: r.reference, amountCents: r.amountCents }));
}

export function liveRows(collaborations: CollaborationDto[]): TrailRow[] {
  return collaborations
    .filter((c) => LIVE.has(c.status) && c.publishedAt)
    .map((c) => ({ id: c.id, at: c.publishedAt ?? c.updatedAt, title: `${c.campaignName} · ${c.brandCompany}`, detail: c.postUrl ?? undefined, href: `/creator/collaborations/${c.id}` }))
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

const DAY_MS = 86_400_000;
const DAY_KEY = 10;
const MONTH_KEY = 7;

// The sparkline behind "Clicks on your links": clicks per day for the last
// `days` days, quiet days at zero, oldest first.
export function clicksPerDay(clicks: CreatorClickRow[], days: number, now: Date): { day: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const c of clicks) counts.set(c.at.slice(0, DAY_KEY), (counts.get(c.at.slice(0, DAY_KEY)) ?? 0) + 1);
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(now.getTime() - (days - 1 - i) * DAY_MS).toISOString().slice(0, DAY_KEY);
    return { day, count: counts.get(day) ?? 0 };
  });
}

// The sparkline behind "Earned to date": released payouts per month for the
// last `months` months, oldest first.
export function earnedPerMonth(ledger: LedgerRowDto[], months: number, now: Date): { month: string; cents: number }[] {
  const sums = new Map<string, number>();
  for (const r of ledger) if (r.type === "payout" && r.status === "completed") sums.set(r.date.slice(0, MONTH_KEY), (sums.get(r.date.slice(0, MONTH_KEY)) ?? 0) + r.amountCents);
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i), 1));
    const month = d.toISOString().slice(0, MONTH_KEY);
    return { month, cents: sums.get(month) ?? 0 };
  });
}
