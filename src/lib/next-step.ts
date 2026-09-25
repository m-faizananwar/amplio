// What happens next on a collaboration, and who holds the ball, for either
// side. Pure: the creator's Needs you list, both sides' collaboration rows and
// their filters read from here, so they can never disagree. Copy lives in
// collaboration.json under nextAction.<role>.<status>.
import type { CollaborationStatus } from "./collaboration-status";

export type Role = "creator" | "brand";
export type Owner = "you" | "them" | "done";
export type NextStepFilter = "needs_you" | "waiting" | "live" | "done";

export const NEXT_STEP_FILTERS: readonly NextStepFilter[] = ["needs_you", "waiting", "live", "done"];

// Whose move it is, from the creator's side. The state machine gives the
// creator exactly these; the brand holds applied, draft_submitted and live.
const CREATOR_MOVES = new Set<CollaborationStatus>(["invited", "accepted", "changes_requested", "approved", "scheduled"]);
const TERMINAL = new Set<CollaborationStatus>(["paid", "declined"]);

export function ownerFor(status: CollaborationStatus, role: Role): Owner {
  if (TERMINAL.has(status)) return "done";
  const creatorsMove = CREATOR_MOVES.has(status);
  return creatorsMove === (role === "creator") ? "you" : "them";
}

// Needs you = your move. Live gets its own group (a post is out there,
// clicks are counting) whoever releases the money; the rest waits on the other side.
export function filterFor(status: CollaborationStatus, role: Role): NextStepFilter {
  if (TERMINAL.has(status)) return "done";
  if (status === "live") return role === "brand" ? "needs_you" : "live";
  return ownerFor(status, role) === "you" ? "needs_you" : "waiting";
}

export function countByFilter(statuses: readonly CollaborationStatus[], role: Role): Record<NextStepFilter, number> {
  const counts: Record<NextStepFilter, number> = { needs_you: 0, waiting: 0, live: 0, done: 0 };
  for (const status of statuses) counts[filterFor(status, role)] += 1;
  return counts;
}

type Row = { id: string; status: CollaborationStatus; dueDate: string | null };

export type NeedsYouItem =
  | { kind: "collaboration"; status: CollaborationStatus; id: string; dueDate: string | null }
  | { kind: "withdraw"; availableCents: number }
  | { kind: "setup" };

// Most urgent first: an unanswered invitation holds the brand's money, a
// change request is a revision round ticking, a scheduled post is due.
const URGENCY: CollaborationStatus[] = ["invited", "changes_requested", "scheduled", "approved", "accepted"];

function byDue(a: Row, b: Row) {
  if (a.dueDate === b.dueDate) return 0;
  if (a.dueDate === null) return 1;
  if (b.dueDate === null) return -1;
  return a.dueDate < b.dueDate ? -1 : 1;
}

// The creator's Overview list: collaborations waiting on them (by urgency,
// then by due date), then money ready to withdraw, then an unfinished card.
export function needsYou(rows: readonly Row[], opts: { availableCents: number; setupIncomplete: boolean }): NeedsYouItem[] {
  const waiting = rows
    .filter((r) => ownerFor(r.status, "creator") === "you")
    .sort((a, b) => URGENCY.indexOf(a.status) - URGENCY.indexOf(b.status) || byDue(a, b))
    .map((r): NeedsYouItem => ({ kind: "collaboration", status: r.status, id: r.id, dueDate: r.dueDate }));
  const items: NeedsYouItem[] = [...waiting];
  if (opts.availableCents > 0) items.push({ kind: "withdraw", availableCents: opts.availableCents });
  if (opts.setupIncomplete) items.push({ kind: "setup" });
  return items;
}
