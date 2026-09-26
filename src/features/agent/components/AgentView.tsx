"use client";

import { Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentComposer } from "./AgentComposer";
import { useCall } from "./call/callContext";
import { AgentThread } from "./AgentThread";
import { AgentOrb } from "./fx/AgentOrb";
import { HistoryBar } from "./rail/HistoryBar";
import { KnowRail, type RailThread } from "./rail/KnowRail";
import { dayTime, minutesOf, startedAt } from "./rail/threadTime";
import { type ThreadMeta, useAgentRun } from "./useAgentRun";

type Props = { role: "brand" | "creator"; firstName: string; csrfToken: string; profile: Array<{ label: string; value: string }>; notes: string[]; threads: RailThread[]; initialThread?: string | null };

const STARTERS = { brand: ["find", "today", "campaign"], creator: ["find", "week", "earned"] } as const;

// The agent page: one conversation column (~760px) with the composer pinned
// under it and the "what I know" rail beside it on wide screens. A call runs
// in the floating widget; while one is on (or just ended), this page is its
// full view: the same thread, with everything the widget shows in small.
export function AgentView({ role, firstName, csrfToken, profile, notes, threads, initialThread = null }: Props) {
  const t = useTranslations("agent");
  const own = useAgentRun(role, csrfToken);
  const call = useCall();
  const run = call && call.status !== "idle" ? call.run : own;
  const live = call?.status === "live" || call?.status === "connecting";
  const locale = useLocale();
  const [current, setCurrent] = useState<RailThread | null>(() => (initialThread ? { id: initialThread, title: "" } : null));
  const [opened, setOpened] = useState<ThreadMeta | null>(null);
  const [loading, setLoading] = useState(Boolean(initialThread));
  const replay = own.replay;
  // a deep link opens its thread once, on arrival
  useEffect(() => {
    if (initialThread) void replay(initialThread).then((meta) => { setOpened(meta); setLoading(false); });
  }, [initialThread]); // eslint-disable-line react-hooks/exhaustive-deps -- once per link, not per render
  const end = useRef<HTMLDivElement>(null);
  const lastUser = [...run.items].reverse().find((i) => i.type === "user");
  useEffect(() => { end.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [run.items.length]);

  const newChat = () => { setCurrent(null); setOpened(null); if (call && !live) call.close(); own.reset(); };
  const resume = (th: RailThread) => {
    setCurrent(th);
    setOpened(null);
    setLoading(true);
    if (call && !live) call.close();
    void own.replay(th.id).then((meta) => { setOpened(meta); setLoading(false); });
  };
  // an opened call starts with its own line: Call · 4 min · Sep 27, 14:02
  const callHeader = opened?.kind === "call" ? [t("rail.callHeader"), opened.durationSec ? t("rail.minutes", { n: minutesOf(opened.durationSec) }) : null, dayTime(startedAt(opened.updatedAt, opened.durationSec), locale)].filter(Boolean).join(" · ") : null;
  const panel = { profile, notes, threads, current: current?.id ?? null, onResume: resume, onNewChat: newChat };

  const thread = loading && run.items.length === 0 ? (
    <div className="grid gap-3 py-6" role="status" aria-label={t("rail.opening")}>
      <Skeleton className="h-10 w-2/5 justify-self-end rounded-card" />
      <Skeleton className="h-16 w-4/5 rounded-card" />
      <Skeleton className="h-10 w-1/3 justify-self-end rounded-card" />
    </div>
  ) : run.items.length === 0 ? (
    <div className="grid justify-items-center gap-5 py-16 text-center">
      <AgentOrb size={64} state="breathing" />
      <div className="grid gap-2"><h2 className="text-h3">{t(`greeting.${role}`, { name: firstName })}</h2><p className="max-w-md text-body text-ink-muted">{t("greeting.sub")}</p></div>
      <div className="flex max-w-xl flex-wrap justify-center gap-2">
        {STARTERS[role].map((key) => <button key={key} type="button" onClick={() => void run.send(t(`starters.${role}.${key}`))} className="rounded-chip border border-rule bg-surface px-4 py-2 text-body shadow-lift outline-none transition-colors duration-(--duration-fast) hover:bg-well focus-visible:ring-2 focus-visible:ring-money">{t(`starters.${role}.${key}`)}</button>)}
      </div>
    </div>
  ) : (
    <AgentThread busy={run.busy} items={run.items} confirms={run.confirms} sample={run.sample} onSend={(text) => void run.send(text)} onDecide={(e, d) => void run.decide(e, d)} onRetry={() => lastUser && lastUser.type === "user" && void run.send(lastUser.text)} />
  );

  return (
    <div className="flex min-w-0 gap-8">
      {/* content-start: the rows never stretch to the rail's height */}
      <div className="mx-auto grid w-full max-w-[760px] min-w-0 content-start gap-6">
        <HistoryBar {...panel} />
        {callHeader ? <p className="flex items-center gap-2 text-small text-ink-muted"><Phone className="size-4" aria-hidden="true" />{callHeader}</p> : null}
        {run.sample ? <p className="justify-self-start rounded-chip bg-attention-soft px-3 py-1 text-caption text-attention" title={t("sample.note")}>{t("sample.badge")} · {t("sample.note")}</p> : null}
        <>
            {thread}
            {/* a turn is under way with no step on screen yet: the orb says so */}
            {run.busy && !run.items.some((i) => i.type === "step" && i.status === "running") ? <p className="flex items-center gap-2.5 text-small text-ink-muted" role="status"><AgentOrb size={32} />{t("steps.running")}</p> : null}
            {/* scrolled to with room for the composer and the assistant pill below it */}
            <div ref={end} className="scroll-mb-48" />
            <div className="sticky bottom-4 z-10 rounded-card bg-paper pt-2"><AgentComposer busy={run.busy} onSend={(text) => void run.send(text)} onCall={() => call?.start()} /></div>
            {/* the composer rests 16px up; this lets the thread end above it rather than under it */}
            <div aria-hidden="true" className="h-2" />
        </>
      </div>
      <KnowRail {...panel} />
    </div>
  );
}
