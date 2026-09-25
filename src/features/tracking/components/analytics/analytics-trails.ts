import type { TrailRow } from "@/components/trail/types";
import type { CreatorClickRow, PublicPostDto, PublicSnapshot } from "@/features/tracking/server/creator-queries";

type T = (key: string, values?: Record<string, string | number>) => string;
const DEVICE_KEY = { desktop: "deviceDesktop", mobile: "deviceMobile", tablet: "deviceTablet", bot: "deviceUnknown", unknown: "deviceUnknown" } as const;
const SNIPPET = 90;

// The rows behind every Analytics number, in the TrailDrawer's shape.
export function followerRows(s: PublicSnapshot, t: T, date: (iso: string) => string): TrailRow[] {
  if (!s.profileReadAt) return [];
  return [{ id: "profile", at: s.profileReadAt, title: s.linkedinUrl, detail: t("followersSource", { url: s.linkedinUrl, date: date(s.profileReadAt) }), href: s.linkedinUrl }];
}

export function postRows(posts: PublicPostDto[], detail: (p: PublicPostDto) => string): TrailRow[] {
  return posts.map((p) => ({ id: p.id, at: p.postedAt, title: p.body.length > SNIPPET ? `${p.body.slice(0, SNIPPET)}…` : p.body, detail: detail(p), href: p.url }));
}

export function clickRows(clicks: CreatorClickRow[], tv: (key: string) => string): TrailRow[] {
  return clicks.map((c) => ({ id: c.id, at: c.at, title: `${c.campaign} · ${c.brand}`, detail: `${c.referrer ?? tv("referrerDirect")} · ${tv(DEVICE_KEY[c.device])}`, href: `/creator/collaborations/${c.collaborationId}` }));
}
