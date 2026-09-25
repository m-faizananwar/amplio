"use client";

import { useTranslations } from "next-intl";
import { QUICK_REACTIONS } from "../../ui-constants";

// Twelve one-tap reactions; they drop the emoji into the composer.
export function QuickReactions({ onPick }: { onPick: (emoji: string) => void }) {
  const t = useTranslations("collaboration.messages.composer");
  return (
    <div role="group" aria-label={t("reactions")} className="flex flex-wrap gap-1">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          aria-label={emoji}
          className="flex size-8 items-center justify-center rounded-chip text-base transition-colors duration-(--duration-fast) hover:bg-tint focus-visible:outline-2 focus-visible:outline-ink"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
