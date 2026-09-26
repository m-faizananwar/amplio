"use client";

import { GripHorizontal, Maximize2, Minus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AgentCall } from "../useAgentCall";
import { CallBody } from "./CallBody";
import { CallDots } from "./CallDots";
import { CallTimer } from "./CallTimer";
import { useCallCorner } from "./useCallCorner";

const WINDOW = { w: 340, h: 460 };
const BUBBLE = { w: 64, h: 64 };

// Desktop: a small window over the app, dragged by its header and snapped to
// a corner, or folded to a round bubble that pulses with the voice. The page
// underneath keeps working and moves when the agent opens something.
export function CallWindow({ call }: { call: AgentCall }) {
  const t = useTranslations("agent.call");
  const place = useCallCorner(call.minimised ? BUBBLE : WINDOW);
  const live = call.status === "live" || call.status === "connecting";
  if (call.minimised) {
    return (
      <button
        type="button"
        className="call-float call-bubble"
        data-moving={place.moving || undefined}
        style={place.style}
        aria-label={t("expand")}
        {...place.handleProps}
        onClick={() => { if (!place.wasDrag()) call.setMinimised(false); }}
      >
        <CallDots mode={call.mode} readInput={call.readInput} readOutput={call.readOutput} className="h-4 w-10" />
        <CallTimer startedAt={call.startedAt} endedAt={call.endedAt} className="call-bubble-timer" />
      </button>
    );
  }
  return (
    <section aria-label={t("start")} className="call-float call-window" data-moving={place.moving || undefined} style={{ ...place.style, width: WINDOW.w, height: WINDOW.h }}>
      <header className="flex items-center gap-1 border-b border-rule px-2 py-1.5">
        <button type="button" className="call-handle" aria-label={t("handle")} {...place.handleProps}>
          <GripHorizontal className="size-4 text-ink-muted" aria-hidden="true" />
          <span className="truncate text-small font-medium">{live ? t("live") : ""}</span>
          <CallTimer startedAt={call.startedAt} endedAt={call.endedAt} className="text-small text-ink-muted" />
        </button>
        <Link href={`/${call.role}/agent`} aria-label={t("fullPage")} data-tip={t("fullPage")} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}><Maximize2 className="size-4" /></Link>
        {live ? <Button variant="ghost" size="icon-sm" aria-label={t("minimise")} onClick={() => call.setMinimised(true)}><Minus /></Button> : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col p-4"><CallBody call={call} /></div>
    </section>
  );
}
