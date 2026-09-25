"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import type { CreatorDto } from "../../schemas";
import { useMarketplace } from "../useMarketplace";

type Props = { creator: CreatorDto; className?: string; size?: "icon-sm" | "icon" };

// The bookmark: persists in the shortlist table, optimistic with rollback.
export function ShortlistButton({ creator, className, size = "icon-sm" }: Props) {
  const { isShortlisted, toggleShortlist } = useMarketplace();
  const on = isShortlisted(creator);
  return (
    <Button
      type="button"
      variant="glass"
      size={size}
      aria-pressed={on}
      aria-label={on ? `Remove ${creator.name} from your shortlist` : `Add ${creator.name} to your shortlist`}
      onClick={() => toggleShortlist(creator)}
      className={cn("rounded-full text-muted-foreground hover:text-brand", on && "text-brand", className)}
    >
      <Bookmark key={String(on)} className={cn("animate-pop size-4", on && "fill-current")} aria-hidden="true" />
    </Button>
  );
}
