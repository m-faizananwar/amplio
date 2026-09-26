"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { type KnowProps, KnowPanel } from "./KnowPanel";

export type { RailThread } from "./ThreadList";

// The right rail, from 1280px: a fresh start, then what the agent knows and
// the earlier conversations. It scrolls on its own, under the top bar.
export function KnowRail({ onNewChat, ...panel }: KnowProps & { onNewChat: () => void }) {
  const t = useTranslations("agent.rail");
  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-20 grid max-h-[calc(100dvh-6rem)] content-start gap-4 overflow-y-auto overscroll-contain pr-1 pb-4">
        <Button variant="quiet" size="sm" icon={<Plus />} onClick={onNewChat} className="justify-self-start">{t("newChat")}</Button>
        <KnowPanel {...panel} />
      </div>
    </aside>
  );
}
