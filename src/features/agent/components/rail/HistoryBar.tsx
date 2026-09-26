"use client";

import { History, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type KnowProps, KnowPanel } from "./KnowPanel";

// Under 1280px the rail folds into this: New chat, and History opening the
// same panel in a drawer from the right.
export function HistoryBar({ onNewChat, onResume, ...panel }: KnowProps & { onNewChat: () => void }) {
  const t = useTranslations("agent.rail");
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-2 xl:hidden">
      <Button variant="quiet" size="sm" icon={<Plus />} onClick={onNewChat}>{t("newChat")}</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="quiet" size="sm" icon={<History />} />}>{t("history")}</SheetTrigger>
        <SheetContent side="right" className="w-[min(22rem,92vw)] gap-4 overflow-y-auto border-rule bg-paper p-4">
          <SheetTitle className="text-h4">{t("history")}</SheetTitle>
          <KnowPanel {...panel} onResume={(th) => { setOpen(false); onResume(th); }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
