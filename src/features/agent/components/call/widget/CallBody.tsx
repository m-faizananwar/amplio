"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AgentCall } from "../useAgentCall";
import { CallDots } from "./CallDots";
import { CallFeed } from "./CallFeed";
import { CallSummary } from "./CallSummary";

// What the call shows in any frame (window or sheet), by state.
export function CallBody({ call }: { call: AgentCall }) {
  const t = useTranslations("agent.call");
  if (call.status === "connecting") {
    return (
      <div className="grid flex-1 content-center justify-items-center gap-4 py-6" role="status">
        <div className="call-ring grid size-24 place-items-center rounded-full"><CallDots mode="thinking" readInput={call.readInput} readOutput={call.readOutput} className="h-6 w-14" /></div>
        <p className="text-small text-ink-muted">{t("connecting")}</p>
      </div>
    );
  }
  if (call.status === "denied" || call.status === "failed") {
    const denied = call.status === "denied";
    return (
      <div className="grid content-start gap-3 py-2" role="alert">
        <h2 className="text-h4">{denied ? t("deniedTitle") : t("failed")}</h2>
        {denied ? <p className="text-small text-ink-muted">{t("deniedBody")}</p> : null}
        <div className="flex flex-wrap gap-2">
          {denied ? <Link href={`/${call.role}/agent`} onClick={call.close} className={buttonVariants({ size: "sm" })}>{t("useChat")}</Link> : <Button size="sm" onClick={call.start}>{t("retry")}</Button>}
          <Button size="sm" variant="ghost" onClick={call.close}>{t("close")}</Button>
        </div>
      </div>
    );
  }
  if (call.status === "ended") return <CallSummary call={call} />;
  return <LiveBody call={call} />;
}

function LiveBody({ call }: { call: AgentCall }) {
  const t = useTranslations("agent.call");
  const feed = useRef<HTMLDivElement>(null);
  const count = call.run.items.length;
  // the newest step or card is the one that matters: keep it (and a card's buttons) in view
  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [count]);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <CallDots mode={call.mode} readInput={call.readInput} readOutput={call.readOutput} className="h-7 w-16 shrink-0" />
        <p className="text-small font-medium" aria-live="polite">{call.mode === "rest" ? " " : t(call.mode === "muted" ? "mute" : call.mode)}</p>
        {call.engineName === "browser" ? <p className="ml-auto truncate text-caption text-ink-muted">{t("browserVoice")}</p> : null}
      </div>
      <dl className="grid gap-1 rounded-control bg-well px-3 py-2 text-small" aria-live="polite">
        <div className="flex min-w-0 gap-2"><dt className="shrink-0 text-ink-muted">{t("you")}</dt><dd className="line-clamp-1 min-w-0">{call.caption.you || "…"}</dd></div>
        <div className="flex min-w-0 gap-2"><dt className="shrink-0 text-ink-muted">{t("agent")}</dt><dd className={`min-w-0 ${call.hasFeed ? "line-clamp-2" : "line-clamp-6"}`}>{call.caption.agent || "…"}</dd></div>
      </dl>
      {/* no thread on this line (no thread storage yet): the voice carries it all, so the captions get the room */}
      {call.hasFeed ? <div ref={feed} className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"><CallFeed call={call} /></div> : <div className="flex-1" />}
      <div className="flex items-center justify-center gap-4">
        <Button size="icon-lg" variant="quiet" aria-pressed={call.muted} aria-label={call.muted ? t("unmute") : t("mute")} onClick={call.toggleMute}>{call.muted ? <MicOff /> : <Mic />}</Button>
        <Button size="icon-lg" variant="ghost" aria-label={t("end")} onClick={call.end} className="bg-failure text-surface hover:bg-failure/90">{<PhoneOff />}</Button>
      </div>
    </div>
  );
}
