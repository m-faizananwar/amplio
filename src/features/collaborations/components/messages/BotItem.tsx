import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ViewerRole } from "../../schemas";
import { SUPPORT_BOT, BOT_THREAD_ID } from "../../ui-constants";

import { BRAND } from "@/config/brand";
// Pinned helper thread at the top of the list, like naano's NaanoBot.
export function BotItem({ role, active }: { role: ViewerRole; active: boolean }) {
  return (
    <li>
      <Link
        href={`/${role}/messages/${BOT_THREAD_ID}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring",
          active ? "bg-brand/5" : "bg-muted/30",
        )}
      >
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground">{/* eslint-disable-next-line @next/next/no-img-element -- the product mark */}<img src="/logo.svg" alt="" className="size-full" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold">{SUPPORT_BOT.name}</span>
            <span className="text-xs text-muted-foreground">Now</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{SUPPORT_BOT.preview}</p>
        </div>
        <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[0.625rem] font-bold text-brand-foreground" aria-label="1 unread">
          1
        </span>
      </Link>
    </li>
  );
}
