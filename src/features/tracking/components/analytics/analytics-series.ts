import type { CreatorClickRow, PublicPostDto } from "@/features/tracking/server/creator-queries";

export type SeriesPoint = { at: string; value: number };

const DAY_MS = 86_400_000;
const DAY_KEY_LENGTH = 10;

const dayOf = (iso: string) => iso.slice(0, DAY_KEY_LENGTH);

// Clicks per day from the first click to the last, empty days included, so
// the line dips to zero instead of skipping a quiet week.
export function clicksByDay(clicks: CreatorClickRow[]): SeriesPoint[] {
  if (clicks.length === 0) return [];
  const counts = new Map<string, number>();
  for (const c of clicks) counts.set(dayOf(c.at), (counts.get(dayOf(c.at)) ?? 0) + 1);
  const days = [...counts.keys()].sort();
  const out: SeriesPoint[] = [];
  for (let t = Date.parse(days[0]); t <= Date.parse(days[days.length - 1]); t += DAY_MS) {
    const day = new Date(t).toISOString().slice(0, DAY_KEY_LENGTH);
    out.push({ at: day, value: counts.get(day) ?? 0 });
  }
  return out;
}

// One point per post, oldest first: its reach, its engagements, or (for the
// post count) how many posts there were by then.
export function postSeries(posts: PublicPostDto[], pick: "reach" | "engagements" | "count"): SeriesPoint[] {
  const sorted = [...posts].sort((a, b) => a.postedAt.localeCompare(b.postedAt));
  return sorted.map((p, i) => ({
    at: dayOf(p.postedAt),
    value: pick === "count" ? i + 1 : pick === "reach" ? p.impressions : p.reactions + p.comments + p.reposts,
  }));
}
