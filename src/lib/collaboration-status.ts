// The collaboration state machine, as docs/plan.md tables it.
// Pure: no io. The db-writing wrapper is features/collaborations/server/transition.ts,
// the only place a status may change.

export const COLLABORATION_STATUSES = [
  "invited",
  "applied",
  "accepted",
  "declined",
  "draft_submitted",
  "changes_requested",
  "approved",
  "scheduled",
  "live",
  "paid",
] as const;
export type CollaborationStatus = (typeof COLLABORATION_STATUSES)[number];

export const COLLABORATION_EVENTS = [
  "invite",
  "apply",
  "accept",
  "decline",
  "submit_draft",
  "approve",
  "request_changes",
  "schedule",
  "publish",
  "pay",
] as const;
export type CollaborationEvent = (typeof COLLABORATION_EVENTS)[number];

export const ACTORS = ["brand", "creator", "system"] as const;
export type Actor = (typeof ACTORS)[number];

export type Transition = {
  from: CollaborationStatus | null; // null = the collaboration is being created
  event: CollaborationEvent;
  actor: Actor;
  to: CollaborationStatus;
};

// One row per allowed move. Anything not listed here is illegal.
export const TRANSITIONS: readonly Transition[] = [
  { from: null, event: "invite", actor: "brand", to: "invited" },
  { from: null, event: "apply", actor: "creator", to: "applied" },
  { from: "invited", event: "accept", actor: "creator", to: "accepted" },
  { from: "invited", event: "decline", actor: "creator", to: "declined" },
  { from: "applied", event: "accept", actor: "brand", to: "accepted" },
  { from: "applied", event: "decline", actor: "brand", to: "declined" },
  { from: "accepted", event: "submit_draft", actor: "creator", to: "draft_submitted" },
  { from: "draft_submitted", event: "approve", actor: "brand", to: "approved" },
  { from: "draft_submitted", event: "request_changes", actor: "brand", to: "changes_requested" },
  { from: "changes_requested", event: "submit_draft", actor: "creator", to: "draft_submitted" },
  { from: "approved", event: "schedule", actor: "creator", to: "scheduled" },
  { from: "scheduled", event: "publish", actor: "creator", to: "live" },
  { from: "live", event: "pay", actor: "system", to: "paid" },
  { from: "live", event: "pay", actor: "brand", to: "paid" },
];

export const TERMINAL_STATUSES: readonly CollaborationStatus[] = ["declined", "paid"];

export class IllegalTransitionError extends Error {
  constructor(
    readonly from: CollaborationStatus | null,
    readonly event: CollaborationEvent,
    readonly actor: Actor,
  ) {
    super(`Illegal transition: ${actor} cannot "${event}" a collaboration in status "${from ?? "(new)"}"`);
    this.name = "IllegalTransitionError";
  }
}

export function findTransition(from: CollaborationStatus | null, event: CollaborationEvent, actor: Actor) {
  return TRANSITIONS.find((t) => t.from === from && t.event === event && t.actor === actor) ?? null;
}

export function nextStatus(from: CollaborationStatus | null, event: CollaborationEvent, actor: Actor) {
  const transition = findTransition(from, event, actor);
  if (!transition) throw new IllegalTransitionError(from, event, actor);
  return transition.to;
}

export function allowedEvents(from: CollaborationStatus | null, actor: Actor): CollaborationEvent[] {
  return TRANSITIONS.filter((t) => t.from === from && t.actor === actor).map((t) => t.event);
}

// Shortest event path from a new collaboration to `target`, for the given
// origin. Used by the seed so fixtures are built through the same rules.
export function pathTo(target: CollaborationStatus, origin: "invitation" | "application"): Transition[] {
  const start = TRANSITIONS.find((t) => t.from === null && t.event === (origin === "invitation" ? "invite" : "apply"));
  if (!start) throw new Error("no start transition");
  const queue: Transition[][] = [[start]];
  const seen = new Set<CollaborationStatus>([start.to]);
  while (queue.length > 0) {
    const path = queue.shift();
    if (!path) break;
    const last = path[path.length - 1];
    if (last.to === target) return path;
    for (const t of TRANSITIONS) {
      if (t.from !== last.to || seen.has(t.to)) continue;
      seen.add(t.to);
      queue.push([...path, t]);
    }
  }
  throw new Error(`no path to ${target} from ${origin}`);
}
