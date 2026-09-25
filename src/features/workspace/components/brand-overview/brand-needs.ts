import type { CollaborationDto } from "@/features/collaborations/schemas";
import { filterFor } from "@/lib/next-step";

// Most urgent first for a brand: a draft is waiting on a review, an applicant
// on a decision, a live post on its payment. Then by due date.
const URGENCY = ["draft_submitted", "applied", "live"] as const;

export function brandNeedsYou(rows: readonly CollaborationDto[]): CollaborationDto[] {
  return rows
    .filter((r) => filterFor(r.status, "brand") === "needs_you")
    .sort((a, b) => {
      const byUrgency = URGENCY.indexOf(a.status as (typeof URGENCY)[number]) - URGENCY.indexOf(b.status as (typeof URGENCY)[number]);
      if (byUrgency !== 0) return byUrgency;
      return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
    });
}
