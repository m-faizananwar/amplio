// Date display helpers over ISO strings (DTOs carry ISO, never Date objects).
import { format, formatDistanceStrict, isToday, isYesterday } from "date-fns";

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const SHORT_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const DAY_MS = 86_400_000;
// Calendar dates are formatted in UTC on both server and client, so a day never
// flips between the UTC server render and a browser in another zone.
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });

// "12 Sept 2026": day first, short month, no weekday — the date on campaign
// cards and ledgers (UTC).
export function formatDay(iso: string | null | undefined): string {
  if (!iso) return "—";
  return DAY_FORMAT.format(new Date(iso));
}

export function formatShortDay(iso: string): string {
  return SHORT_FORMAT.format(new Date(iso));
}

export function formatDate(iso: string | null | undefined, fallback = "—"): string {
  if (!iso) return fallback;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? fallback : DATE_FORMAT.format(date);
}

export function formatDateTime(iso: string | null | undefined, fallback = "—"): string {
  if (!iso) return fallback;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? fallback : DATE_TIME_FORMAT.format(date);
}

// "2 hours ago", "3 days ago" — for "Updated" columns and thread previews.
// `now` lets a client component pass a post-hydration clock (see components/TimeAgo).
export function timeAgo(iso: string | null | undefined, fallback = "—", now = Date.now()): string {
  if (!iso) return fallback;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? fallback : `${formatDistanceStrict(date, new Date(now))} ago`;
}

// Chat-style stamp: time today, "Yesterday", otherwise the date.
export function messageStamp(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM");
}

// yyyy-mm-dd for <input type="date">: a Date formats in local time, an ISO
// string is sliced (UTC). Empty input gives "".
export function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) return format(value, "yyyy-MM-dd");
  return value.slice(0, "yyyy-mm-dd".length);
}

export function daysUntil(iso: string | null | undefined, now = Date.now()): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - now) / DAY_MS);
}
