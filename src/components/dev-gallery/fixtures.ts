import type { TrailRow } from "@/components/trail/types"
import type { ComboboxOption } from "@/components/ui/combobox"
import type { CollaborationStatus } from "@/lib/collaboration-status"

// Gallery fixtures — shown only on /dev/ui, to exercise the components. The app
// itself never renders these; its numbers come from the database.
export const COUNTRY_OPTIONS: ComboboxOption[] = [
  { value: "FR", label: "France", hint: "FR" },
  { value: "DE", label: "Germany", hint: "DE" },
  { value: "GB", label: "United Kingdom", hint: "GB" },
  { value: "NL", label: "Netherlands", hint: "NL" },
  { value: "ES", label: "Spain", hint: "ES" },
  { value: "US", label: "United States", hint: "US" },
]

export const STATUSES: CollaborationStatus[] = [
  "invited", "applied", "accepted", "draft_submitted", "changes_requested", "approved", "scheduled", "live", "paid", "declined",
]

export const SPARK = [3, 5, 4, 8, 7, 11, 9, 14, 13, 18]

export const TRAIL_ROWS: TrailRow[] = Array.from({ length: 9 }, (_, i) => ({
  id: `row-${i}`,
  at: new Date(Date.UTC(2026, 8, 25, 14 - i, 5 * i)).toISOString(),
  title: ["Tom Bechtelar", "Althea Altenwerth", "Hyman Wiza"][i % 3],
  detail: ["linkedin.com · desktop", "linkedin.com · mobile", "direct · desktop"][i % 3],
  source: i % 4 === 0 ? "sign-up" : "click",
}))

export type GalleryRow = { id: string; creator: string; status: CollaborationStatus; clicks: number; feeCents: number }

export const TABLE_ROWS: GalleryRow[] = [
  { id: "a", creator: "Tom Bechtelar", status: "live", clicks: 160, feeCents: 45000 },
  { id: "b", creator: "Althea Altenwerth", status: "draft_submitted", clicks: 0, feeCents: 38000 },
  { id: "c", creator: "Hyman Wiza", status: "paid", clicks: 212, feeCents: 52000 },
  { id: "d", creator: "Heber Sanford", status: "invited", clicks: 0, feeCents: 30000 },
]
