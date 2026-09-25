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
