// What a creator should do next on each collaboration, and who holds the
// ball. Pure: the Overview's "Needs you" list, the Collaborations rows and
// their filters all read from here, so they can never disagree. Labels live
// in the i18n files under creator.collaborations.nextAction.<status>.
import type { CollaborationStatus } from "./collaboration-status";

export type Owner = "you" | "brand" | "done";
export type CreatorFilter = "needs_you" | "waiting" | "live" | "done";

export const CREATOR_FILTERS: readonly CreatorFilter[] = ["needs_you", "waiting", "live", "done"];

const OWNER: Record<CollaborationStatus, Owner> = {
  invited: "you",
  applied: "brand",
  accepted: "you",
  draft_submitted: "brand",
  changes_requested: "you",
  approved: "you",
  scheduled: "you",
  live: "brand",
  paid: "done",
  declined: "done",
};

const FILTER: Record<CollaborationStatus, CreatorFilter> = {
  invited: "needs_you",
  accepted: "needs_you",
  changes_requested: "needs_you",
  approved: "needs_you",
  scheduled: "needs_you",
  applied: "waiting",
  draft_submitted: "waiting",
  live: "live",
  paid: "done",
  declined: "done",
};

// Most urgent first: an unanswered invitation holds the brand's money, a
// change request is a revision round ticking, a scheduled post is due.
const URGENCY: CollaborationStatus[] = ["invited", "changes_requested", "scheduled", "approved", "accepted"];

export function ownerOf(status: CollaborationStatus): Owner {
  return OWNER[status];
}

export function creatorFilterFor(status: CollaborationStatus): CreatorFilter {
  return FILTER[status];
}

export function countByFilter(statuses: readonly CollaborationStatus[]): Record<CreatorFilter, number> {
  const counts: Record<CreatorFilter, number> = { needs_you: 0, waiting: 0, live: 0, done: 0 };
  for (const status of statuses) counts[FILTER[status]] += 1;
  return counts;
}

type Row = { id: string; status: CollaborationStatus; dueDate: string | null };

export type NeedsYouItem =
  | { kind: "collaboration"; status: CollaborationStatus; id: string; dueDate: string | null }
  | { kind: "withdraw"; availableCents: number }
  | { kind: "setup" };

function byDue(a: Row, b: Row) {
  if (a.dueDate === b.dueDate) return 0;
  if (a.dueDate === null) return 1;
  if (b.dueDate === null) return -1;
  return a.dueDate < b.dueDate ? -1 : 1;
}

// The Overview list: collaborations waiting on the creator (by urgency, then
// by due date), then money ready to withdraw, then an unfinished card.
export function needsYou(rows: readonly Row[], opts: { availableCents: number; setupIncomplete: boolean }): NeedsYouItem[] {
  const waiting = rows
    .filter((r) => OWNER[r.status] === "you")
    .sort((a, b) => URGENCY.indexOf(a.status) - URGENCY.indexOf(b.status) || byDue(a, b))
    .map((r): NeedsYouItem => ({ kind: "collaboration", status: r.status, id: r.id, dueDate: r.dueDate }));
  const items: NeedsYouItem[] = [...waiting];
  if (opts.availableCents > 0) items.push({ kind: "withdraw", availableCents: opts.availableCents });
  if (opts.setupIncomplete) items.push({ kind: "setup" });
  return items;
}
