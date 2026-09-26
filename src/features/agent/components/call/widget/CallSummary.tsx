"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { AgentCall } from "../useAgentCall";
import { formatDuration } from "./CallTimer";

// After the call: how long it ran and what it changed (every confirmed action,
// with its amount), then back to the same thread in chat, or away.
export function CallSummary({ call }: { call: AgentCall }) {
  const t = useTranslations("agent.call");
  const duration = call.startedAt && call.endedAt ? formatDuration(call.endedAt - call.startedAt) : null;
  return (
    <div className="agent-rise grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-h4">{t("summaryTitle")}</h2>
        {duration ? <p className="text-small text-ink-muted">{t("duration")} <span className="num font-mono text-ink">{duration}</span></p> : null}
      </div>
      <div className="grid gap-1.5">
        <p className="text-caption font-medium text-ink-muted">{t("doneTitle")}</p>
        {call.done.length ? (
          <ul className="grid gap-1">
            {call.done.map((d) => (
              <li key={d.id} className="flex items-start gap-2 rounded-control bg-money-soft px-2.5 py-2 text-small text-ink">
                <Check className="mt-0.5 size-4 shrink-0 text-money" aria-hidden="true" />
                <span className="min-w-0">{d.title}{d.amount ? <span className="num font-mono"> · {d.amount}</span> : null}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-small text-ink-muted">{t("nothingDone")}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {call.run.items.length ? <Button size="sm" onClick={call.continueInChat}>{t("continueChat")}</Button> : null}
        <Button size="sm" variant="ghost" onClick={call.close}>{t("close")}</Button>
      </div>
    </div>
  );
}
