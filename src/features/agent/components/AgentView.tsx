"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { TrailDots } from "@/features/assistant/components/TrailDots";
import { AgentComposer } from "./AgentComposer";
import { AgentThread } from "./AgentThread";
import { KnowRail } from "./KnowRail";
import { useAgentRun } from "./useAgentRun";
import { VoiceView } from "./VoiceView";

type Props = { role: "brand" | "creator"; firstName: string; profile: Array<{ label: string; value: string }> };

const STARTERS = { brand: ["find", "today", "campaign"], creator: ["find", "week", "earned"] } as const;

// The agent page: one conversation column (~760px) with the composer pinned
// under it, the "what I know" rail beside it on wide screens, and a voice
// view that drives the same run.
export function AgentView({ role, firstName, profile }: Props) {
  const t = useTranslations("agent");
  const run = useAgentRun(role);
  const [voice, setVoice] = useState(false);
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
        {run.sample ? <p className="justify-self-start rounded-chip bg-attention-soft px-3 py-1 text-caption text-attention" title={t("sample.note")}>{t("sample.badge")} · {t("sample.note")}</p> : null}
        {voice ? (
          <VoiceView items={run.items} confirms={run.confirms} busy={run.busy} onSend={(text) => void run.send(text)} onDecide={(e, d) => void run.decide(e, d)} onClose={() => setVoice(false)} />
        ) : (
          <>
            {thread}
            <div ref={end} />
            <div className="sticky bottom-24 z-10 rounded-card bg-paper pt-2"><AgentComposer busy={run.busy} onSend={(text) => void run.send(text)} onCall={() => setVoice(true)} /></div>
          </>
        )}
      </div>
      <KnowRail profile={profile} onNewChat={run.reset} />
    </div>
  );
}
