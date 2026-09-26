"use client";

import { Mic, MicOff, Phone } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Markdown } from "@/components/markdown/Markdown";
import { useEffect, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AgentCall } from "../useAgentCall";
import { AgentAvatar } from "../../identity/AgentAvatar";
import { CallGlow } from "./CallGlow";
import { CallFeed } from "./CallFeed";
import { CallSummary } from "./CallSummary";

// What the call shows in any frame (window or sheet), by state.
export function CallBody({ call }: { call: AgentCall }) {
  const t = useTranslations("agent.call");
  if (call.status === "connecting") {
    return (
      <div className="grid flex-1 content-center justify-items-center gap-4 py-6" role="status">
        <CallGlow mode="thinking" readInput={call.readInput} readOutput={call.readOutput} className="grid size-24 place-items-center rounded-full bg-well"><AgentAvatar size={52} state="working" /></CallGlow>
        <p className="text-small text-ink-muted">{t("connecting")}</p>
        <div className="call-controls"><HangUp label={t("end")} onClick={call.end} turn /></div>
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
        <CallGlow mode={call.mode} readInput={call.readInput} readOutput={call.readOutput} className="call-glow-pill">
          <p className="text-small font-medium" aria-live="polite">{call.mode === "rest" ? " " : t(call.mode === "muted" ? "mute" : call.mode)}</p>
        </CallGlow>
        {call.engineName === "browser" ? <p className="ml-auto truncate text-caption text-ink-muted">{t("browserVoice")}</p> : null}
      </div>
      <dl className="grid gap-1 rounded-control bg-well px-3 py-2 text-small" aria-live="polite">
        <div className="flex min-w-0 gap-2"><dt className="shrink-0 text-ink-muted">{t("you")}</dt><dd className="line-clamp-1 min-w-0">{call.caption.you || "…"}</dd></div>
        <div className="flex min-w-0 gap-2"><dt className="shrink-0 text-ink-muted">{t("agent")}</dt><dd className={`min-w-0 ${call.hasFeed ? "line-clamp-2" : "line-clamp-6"}`}>{call.caption.agent ? <Markdown compact text={call.caption.agent} /> : "…"}</dd></div>
      </dl>
      {/* no thread on this line (no thread storage yet): the voice carries it all, so the captions get the room */}
      {call.hasFeed ? <div ref={feed} className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"><CallFeed call={call} /></div> : <div className="flex-1" />}
      <div className="call-controls flex items-center justify-center gap-4">
        <Button size="icon-lg" variant="quiet" aria-pressed={call.muted} aria-label={call.muted ? t("unmute") : t("mute")} onClick={call.toggleMute}>{call.muted ? <MicOff /> : <Mic />}</Button>
        <HangUp label={t("end")} onClick={call.end} />
      </div>
    </div>
  );
}

// the phone that answered, turned over (call.css); `turn` plays the turn as the call opens
function HangUp({ label, onClick, turn }: { label: string; onClick: () => void; turn?: boolean }) {
  return <Button size="icon-lg" variant="ghost" aria-label={label} onClick={onClick} data-turn={turn || undefined} className="call-hangup bg-failure text-surface hover:bg-failure/90"><Phone /></Button>;
}
