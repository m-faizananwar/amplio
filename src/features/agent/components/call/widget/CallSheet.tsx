"use client";

import { ChevronUp, Maximize2, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, type PointerEvent, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { AgentCall } from "../useAgentCall";
import { CallBody } from "./CallBody";
import { AgentAvatar } from "../../identity/AgentAvatar";
import { CallBeam } from "./CallBeam";
import { CallGlow } from "./CallGlow";
import { CallTimer } from "./CallTimer";

const DISMISS_PX = 80;

// Phones: a bottom sheet. Pull it down (or press ↓ on its grip) and it folds
// to a bar that stays above the page's own controls; tap the bar to open it.
export function CallSheet({ call }: { call: AgentCall }) {
  const t = useTranslations("agent.call");
  const pathname = usePathname();
  const [pull, setPull] = useState(0);
  const from = useRef<number | null>(null);
  const live = call.status === "live" || call.status === "connecting";
  // on the agent page the bar sits above the composer; elsewhere at the foot (the dock steps aside during a call)
  const barPlace = pathname.endsWith("/agent") ? "call-bar--agent" : "call-bar--app";

  if (call.minimised) {
    return (
      <div className={cn("call-bar", barPlace)}>
        <button type="button" className="flex min-w-0 flex-1 items-center gap-3 px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-money" aria-label={t("expand")} onClick={() => call.setMinimised(false)}>
          <CallGlow mode={call.mode} readInput={call.readInput} readOutput={call.readOutput} className="grid size-8 shrink-0 place-items-center rounded-full"><AgentAvatar size={24} state={call.mode === "speaking" || call.run.busy ? "working" : "default"} /></CallGlow>
          <span className="truncate text-small font-medium">{t("live")}</span>
          <CallTimer startedAt={call.startedAt} className="text-small text-ink-muted" />
          <ChevronUp className="ml-auto size-4 text-ink-muted" aria-hidden="true" />
        </button>
        <Button size="icon-sm" variant="ghost" aria-label={t("end")} onClick={call.end} className="call-hangup mr-1.5 bg-failure text-surface hover:bg-failure/90"><Phone /></Button>
      </div>
    );
  }

  const grip = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => { e.currentTarget.setPointerCapture(e.pointerId); from.current = e.clientY; },
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => { if (from.current !== null) setPull(Math.max(0, e.clientY - from.current)); },
    onPointerUp: () => { from.current = null; if (pull > DISMISS_PX && live) call.setMinimised(true); setPull(0); },
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => { if (e.key === "ArrowDown" && live) { e.preventDefault(); call.setMinimised(true); } },
  };
  return (
    <section aria-label={t("start")} className="call-sheet" data-moving={pull > 0 || undefined} style={{ transform: `translateY(${pull}px)` }}>
      <button type="button" className="call-sheet-grip" aria-label={t("sheetHandle")} {...grip}><span aria-hidden="true" /></button>
      <CallBeam working={live && call.run.busy} radius={24} className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 px-4 pb-2">
        <AgentAvatar size={22} state={call.mode === "speaking" || call.run.busy ? "working" : "default"} />
        <span className="truncate text-small font-medium">{live ? t("live") : ""}</span>
        <CallTimer startedAt={call.startedAt} endedAt={call.endedAt} className="text-small text-ink-muted" />
        <Link href={`/${call.role}/agent`} aria-label={t("fullPage")} className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "ml-auto")}><Maximize2 className="size-4" /></Link>
      </header>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-[calc(16px+env(safe-area-inset-bottom))]"><CallBody call={call} /></div>
      </CallBeam>
    </section>
  );
}
