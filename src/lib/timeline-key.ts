// Which sentence a collaboration event reads as: the same event is "You
// accepted the invitation" or "{brand} accepted your application" depending on
// where it came from. Pure; copy lives in collaboration.json under
// detail.<role>.timeline.<key>.
import type { Actor, CollaborationEvent, CollaborationStatus } from "./collaboration-status";

export type TimelineKey =
  | "invite" | "apply" | "acceptInvitation" | "acceptApplication" | "declineInvitation" | "declineApplication"
  | "submitDraft" | "resubmitDraft" | "approve" | "requestChanges" | "schedule" | "publish" | "payBrand" | "paySystem" | "unknown";

const SIMPLE: Partial<Record<CollaborationEvent, TimelineKey>> = {
  invite: "invite", apply: "apply", approve: "approve", request_changes: "requestChanges", schedule: "schedule", publish: "publish",
};

export function timelineKey(event: CollaborationEvent, actor: Actor, fromStatus: CollaborationStatus | null): TimelineKey {
  const simple = SIMPLE[event];
  if (simple) return simple;
  const fromInvite = fromStatus === "invited";
  if (event === "accept") return fromInvite ? "acceptInvitation" : "acceptApplication";
  if (event === "decline") return fromInvite ? "declineInvitation" : "declineApplication";
  if (event === "submit_draft") return fromStatus === "changes_requested" ? "resubmitDraft" : "submitDraft";
  if (event === "pay") return actor === "system" ? "paySystem" : "payBrand";
  return "unknown";
}
