import { cn } from "@/lib/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/dates";
import type { MessageDto } from "../../schemas";

export function MessageBubble({ message: m, pending = false }: { message: MessageDto; pending?: boolean }) {
  return (
    <li className={cn("flex items-end gap-2", m.mine && "flex-row-reverse")}>
      <Avatar size="sm">
        {m.senderAvatarUrl ? <AvatarImage src={m.senderAvatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-foreground text-background">{m.senderName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[75%]", m.mine && "text-right")}>
        <p className={cn("text-xs text-muted-foreground", m.mine && "text-right")}>
          {m.senderName} · <time dateTime={m.createdAt}>{formatDateTime(m.createdAt)}</time>
          {pending ? " · sending…" : ""}
        </p>
        <p
          className={cn(
            "mt-1 inline-block rounded-2xl px-3.5 py-2 text-left text-sm whitespace-pre-line",
            m.mine ? "rounded-br-sm bg-brand text-brand-foreground" : "rounded-bl-sm bg-muted",
            pending && "opacity-60",
          )}
        >
          {m.body}
        </p>
      </div>
    </li>
  );
}
