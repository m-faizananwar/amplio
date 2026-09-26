// Pure time labels for the thread list and the call header.
const MINUTE_S = 60;
const HOUR_S = 3600;
const DAY_S = 86_400;
const SECOND_MS = 1000;

export function ago(iso: string, now: number, locale: string): string {
  const diff = Math.round((new Date(iso).getTime() - now) / SECOND_MS);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "narrow" });
  const abs = Math.abs(diff);
  if (abs < MINUTE_S) return rtf.format(0, "minute");
  if (abs < HOUR_S) return rtf.format(Math.round(diff / MINUTE_S), "minute");
  if (abs < DAY_S) return rtf.format(Math.round(diff / HOUR_S), "hour");
  return rtf.format(Math.round(diff / DAY_S), "day");
}

export const minutesOf = (sec: number) => Math.max(1, Math.round(sec / MINUTE_S));

export function sameDay(iso: string, now: number): boolean {
  const a = new Date(iso);
  const b = new Date(now);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const startedAt = (updatedAt: string, durationSec = 0) => new Date(new Date(updatedAt).getTime() - durationSec * SECOND_MS);

export const dayTime = (date: Date, locale: string) => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
