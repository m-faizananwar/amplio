"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { TrailDots } from "@/features/assistant/components/TrailDots";
import { AgentComposer } from "./AgentComposer";
import { useCall } from "./call/callContext";
import { AgentThread } from "./AgentThread";
import { KnowRail, type RailThread } from "./KnowRail";
import { useAgentRun } from "./useAgentRun";

type Props = { role: "brand" | "creator"; firstName: string; csrfToken: string; profile: Array<{ label: string; value: string }>; notes: string[]; threads: RailThread[] };

const STARTERS = { brand: ["find", "today", "campaign"], creator: ["find", "week", "earned"] } as const;

// The agent page: one conversation column (~760px) with the composer pinned
// under it and the "what I know" rail beside it on wide screens. A call runs
// in the floating widget; while one is on (or just ended), this page is its
// full view: the same thread, with everything the widget shows in small.
export function AgentView({ role, firstName, csrfToken, profile, notes, threads }: Props) {
  const t = useTranslations("agent");
  const own = useAgentRun(role, csrfToken);
  const call = useCall();
  const run = call && call.status !== "idle" ? call.run : own;
  const live = call?.status === "live" || call?.status === "connecting";
  const [current, setCurrent] = useState<RailThread | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const lastUser = [...run.items].reverse().find((i) => i.type === "user");
  useEffect(() => { end.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [run.items.length]);

  const thread = run.items.length === 0 ? (
    <div className="grid justify-items-center gap-5 py-16 text-center">
      <TrailDots state="idle" className="h-5 w-12" />
      <div className="grid gap-2"><h2 className="text-h3">{t(`greeting.${role}`, { name: firstName })}</h2><p className="max-w-md text-body text-ink-muted">{t("greeting.sub")}</p></div>
      <div className="flex max-w-xl flex-wrap justify-center gap-2">
        {STARTERS[role].map((key) => <button key={key} type="button" onClick={() => void run.send(t(`starters.${role}.${key}`))} className="rounded-chip border border-rule bg-surface px-4 py-2 text-body shadow-lift outline-none transition-colors duration-(--duration-fast) hover:bg-well focus-visible:ring-2 focus-visible:ring-money">{t(`starters.${role}.${key}`)}</button>)}
      </div>
    </div>
  ) : (
    <AgentThread items={run.items} confirms={run.confirms} sample={run.sample} onSend={(text) => void run.send(text)} onDecide={(e, d) => void run.decide(e, d)} onRetry={() => lastUser && lastUser.type === "user" && void run.send(lastUser.text)} />
  );

  return (
    <div className="flex gap-8">
      <div className="mx-auto grid w-full max-w-[760px] min-w-0 gap-6">
        {current && run.items.length === 0 ? <p className="max-w-full justify-self-start truncate rounded-chip bg-well px-3 py-1 text-caption text-ink-muted">{current.title}</p> : null}
        {run.sample ? <p className="justify-self-start rounded-chip bg-attention-soft px-3 py-1 text-caption text-attention" title={t("sample.note")}>{t("sample.badge")} · {t("sample.note")}</p> : null}
        <>
            {thread}
            {/* scrolled to with room for the composer and the assistant pill below it */}
            <div ref={end} className="scroll-mb-64" />
            <div className="sticky bottom-24 z-10 rounded-card bg-paper pt-2"><AgentComposer busy={run.busy} onSend={(text) => void run.send(text)} onCall={() => call?.start()} /></div>
            {/* the composer rests 96px up; this lets the thread end above it rather than under it */}
            <div aria-hidden="true" className="h-20" />
        </>
      </div>
      <KnowRail profile={profile} notes={notes} threads={threads} current={current?.id ?? null} onNewChat={() => { setCurrent(null); if (call && !live) call.close(); own.reset(); }} onResume={(th) => { setCurrent(th); if (call && !live) call.close(); void own.replay(th.id); }} />
    </div>
  );
}
