import type { CollaborationStatus } from "@/lib/collaboration-status";
import { DrawOnPath } from "./DrawOnPath";

// One small drawn glyph per collaboration state. Keyed on the status by the
// caller, so a change redraws: the envelope becomes two joined dots, then a
// pen line, a check, a pulse, a coin. Stroke only, currentColor.
const PATHS: Record<CollaborationStatus, string[]> = {
  invited: ["M3 5.5h14v9H3z", "M3 6l7 5 7-5"],
  applied: ["M4 10h11", "M11 6l4 4-4 4"],
  accepted: ["M5 10h10", "M5 10m-1.8 0a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0", "M15 10m-1.8 0a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0"],
  draft_submitted: ["M4.5 15.5l1-3.5 8-8 2.5 2.5-8 8z", "M4 17.5h12"],
  changes_requested: ["M15 7.5A5.5 5.5 0 1 0 15.5 12", "M15.5 4.5v3.5H12"],
  approved: ["M4.5 10.5l3.5 3.5 7.5-8"],
  scheduled: ["M3.5 5h13v11h-13z", "M3.5 8.5h13", "M7 3v3.5M13 3v3.5"],
  live: ["M2 10h4l2-5 3 10 2-5h5"],
  paid: ["M10 10m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0", "M10 6.5v7", "M8 8.5h3.5a1.5 1.5 0 0 1 0 3H8"],
  declined: ["M6 6l8 8", "M14 6l-8 8"],
};

export function StatusGlyph({ status, className = "size-4" }: { status: CollaborationStatus; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} strokeWidth="1.6" aria-hidden="true">
      {PATHS[status].map((d, i) => <DrawOnPath key={d} d={d} delay={i * 90} duration={380} />)}
    </svg>
  );
}
