import { cn } from "@/lib/cn";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { messageStamp } from "@/lib/dates";
import type { ThreadDto, ViewerRole } from "../../schemas";

type Props = { thread: ThreadDto; role: ViewerRole; active: boolean };

export function ThreadListItem({ thread: t, role, active }: Props) {
  return (
    <li>
      <Link
        prefetch={false}
        href={`/${role}/messages/${t.collaborationId}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring",
          active && "bg-brand/5",
        )}
      >
        <Avatar size="lg">
          {t.counterpartAvatarUrl ? <AvatarImage src={t.counterpartAvatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-foreground font-semibold text-background">{t.counterpartInitial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold">{t.counterpartName}</span>
            {t.lastMessageAt ? <span className="shrink-0 text-xs text-muted-foreground">{messageStamp(t.lastMessageAt)}</span> : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">{t.campaignName}</p>
          <p className="truncate text-xs text-muted-foreground">{t.lastMessagePreview ?? "No messages yet — say hello."}</p>
        </div>
      </Link>
    </li>
  );
}
