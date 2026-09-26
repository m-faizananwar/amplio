"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef, useState, useSyncExternalStore } from "react";
import { useBump } from "@/components/motion/useBump";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ShellNotification } from "../viewer";

const MINUTE_MS = 60_000;
const HOUR_MIN = 60;
const DAY_H = 24;

// "now" is read once on the client after hydration (server snapshot 0), so the
// relative labels never differ between the server render and the hydrating
// client — a prod-only mismatch when the two clocks straddle a minute.
const subscribeNever = () => () => undefined;
function useClientNow() {
  const at = useRef(0);
  return useSyncExternalStore(subscribeNever, () => at.current || (at.current = Date.now()), () => 0);
}

// The bell: what moved on your collaborations and messages, newest first.
export function NotificationsButton({ notifications, role }: { notifications: ShellNotification[]; role: "brand" | "creator" }) {
  const t = useTranslations("shell.topBar.notifications");
  const tn = useTranslations("shell.notifications");
  const time = useTranslations("common.time");
  const [open, setOpen] = useState(false);
  const now = useClientNow();
  const count = notifications.length;
  const swing = useBump(count, { onlyUp: true });
  const bump = useBump(count);
  // Worded here, from the row's facts, so the bell reads in the viewer's language.
  const words = (n: ShellNotification) => {
    const vars = { name: n.counterpart, campaign: n.campaign };
    if (n.kind === "message" || !n.status) return { title: tn("message.title", vars), body: tn("message.body", vars) };
    const key = n.resubmitted ? `${role}.resubmitted` : `${role}.${n.status}`;
    return { title: tn(`${key}.title`, vars), body: tn(`${key}.body`, vars) };
  };
  const ago = (iso: string) => {
    if (!now) return "";
    const min = Math.max(0, Math.round((now - Date.parse(iso)) / MINUTE_MS));
    if (min < 1) return time("justNow");
    if (min < HOUR_MIN) return time("minutesAgo", { count: min });
    const h = Math.round(min / HOUR_MIN);
    return h < DAY_H ? time("hoursAgo", { count: h }) : time("daysAgo", { count: Math.round(h / DAY_H) });
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`${t("label")} · ${t("unreadCount", { count })}`} className="relative" />}>
        <Bell key={`bell-${swing}`} className={swing ? "bell-swing" : undefined} aria-hidden="true" />
        {count > 0 ? <span key={`dot-${bump}`} className={`absolute top-1.5 right-1.5 size-2 rounded-full bg-attention ring-2 ring-surface ${bump ? "badge-bump" : ""}`} aria-hidden="true" /> : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] gap-0 p-0">
        <p className="border-b border-rule px-4 py-3 text-body font-medium">{t("label")}</p>
        {count === 0 ? (
          <p className="px-4 py-8 text-center text-body text-ink-muted">{t("empty")}</p>
        ) : (
          <ul className="max-h-96 divide-y divide-rule overflow-y-auto">
            {notifications.map((n, i) => { const w = words(n); return (
              <li key={n.id} className="animate-rise" style={i < 12 ? { animationDelay: `${i * 20}ms` } : undefined}>
                <Link href={n.href} onClick={() => setOpen(false)} className="grid gap-0.5 px-4 py-2.5 outline-none hover:bg-tint focus-visible:bg-tint">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-body text-ink">{w.title}</span>
                    <span className="num shrink-0 text-caption text-ink-muted">{ago(n.at)}</span>
                  </span>
                  <span className="text-small text-ink-muted">{w.body}</span>
                </Link>
              </li>
            ); })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
