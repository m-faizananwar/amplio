import type { CollaborationStatus } from "@/lib/collaboration-status";
import { filterFor } from "@/lib/next-step";

// What listCollaborations returns: the filter applied, then exactly the number
// asked for, most recent first (the queries order by last update), plus the
// total so the model never mistakes a trimmed list for all of them. Pure.
export const COLLAB_DEFAULT = 8;
export const COLLAB_MAX = 20;
type Row = { id: string; campaignName: string; status: CollaborationStatus; feeCents: number };

export function pickCollaborations<T extends Row>(rows: T[], opts: { role: "brand" | "creator"; filter?: unknown; limit?: unknown; counterpart: (row: T) => string }) {
  const filter = typeof opts.filter === "string" && opts.filter ? opts.filter : null;
  const n = typeof opts.limit === "number" && Number.isFinite(opts.limit) ? Math.min(COLLAB_MAX, Math.max(1, Math.round(opts.limit))) : COLLAB_DEFAULT;
  const matching = rows.filter((c) => !filter || filterFor(c.status, opts.role) === filter);
  const items = matching.slice(0, n).map((c) => ({ id: c.id, campaign: c.campaignName, counterpart: opts.counterpart(c), status: c.status, nextAction: filterFor(c.status, opts.role), feeCents: c.feeCents }));
  return { total: matching.length, items };
}
