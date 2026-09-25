"use client";

import { Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ShellNotification } from "../viewer";

type Props = { role: "brand" | "creator"; notifications: ShellNotification[] };

// "now" is read once on the client after hydration (server snapshot 0), so the
// relative labels never differ between the server render and the hydrating
// client — a prod-only mismatch when the two clocks straddle a minute.
const subscribeNever = () => () => undefined;
function useClientNow() {
  const at = useRef(0);
  return useSyncExternalStore(subscribeNever, () => at.current || (at.current = Date.now()), () => 0);
}

function relative(iso: string, now: number) {
  if (!now) return "recently";
  const diffMin = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (diffMin < 60) return diffMin <= 1 ? "just now" : `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} h ago`;
  return `${Math.round(diffH / 24)} d ago`;
}

// The bell: collaboration events + messages for the current user, newest first.
export function NotificationsButton({ role, notifications }: Props) {
  const [open, setOpen] = useState(false);
  const now = useClientNow();
  const count = notifications.length;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="icon" aria-label={count > 0 ? `Notifications (${count} new)` : "Notifications"} className="relative" />}>
        <Bell aria-hidden="true" />
        {count > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground" aria-hidden="true">
            {count}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand"><Bell className="size-4" aria-hidden="true" /></span>
          <h2 className="text-sm font-semibold">Notifications</h2>
        </div>
        {count === 0 ? (
          <div className="grid justify-items-center gap-1 px-4 py-8 text-center">
            <CheckCircle2 className="size-5 text-muted-foreground" aria-hidden="true" />
            <p className="mt-1 text-sm font-semibold">You&apos;re all caught up</p>
            <p className="text-xs text-muted-foreground">New activity on your {role === "brand" ? "campaigns" : "collaborations"} will show up here.</p>
          </div>
        ) : (
          <ul className="list-stagger max-h-96 overflow-y-auto py-1">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link href={n.href} onClick={() => setOpen(false)} className="grid gap-0.5 px-4 py-2.5 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{relative(n.at, now)}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{n.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
