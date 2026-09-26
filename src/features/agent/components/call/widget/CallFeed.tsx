"use client";

import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ConfirmEvent, ResultEvent, StepEvent } from "../../../events";
import { ConfirmCard } from "../../ConfirmCard";
import { StepGroup } from "../../StepGroup";
import type { AgentCall } from "../useAgentCall";

const LAST_STEPS = 4;
const LAST_RESULTS = 3;

const countOf = (r: ResultEvent) => ("items" in r ? r.items.length : null);

// The call's work in small: the latest steps, a chip per result (the page
// under the call has the full card), and the latest confirm, big enough to tap.
export function CallFeed({ call }: { call: AgentCall }) {
  const t = useTranslations("agent.call");
  const items = call.run.items;
  const steps = items.filter((i): i is typeof i & StepEvent => i.type === "step").slice(-LAST_STEPS);
  const results = items.filter((i): i is typeof i & ResultEvent => i.type === "result").slice(-LAST_RESULTS);
  // the latest card, open or settled, so a confirm turns into its receipt here too
  const card = [...items].reverse().find((i): i is typeof i & ConfirmEvent => i.type === "confirm") ?? null;
  const open = card && (call.run.confirms[card.id] ?? "open") === "open" ? card : null;
  if (!steps.length && !results.length && !card) return <p className="px-1 text-small text-ink-muted">{call.feedOk ? t("feedEmpty") : t("feedInChat")}</p>;
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
      {steps.length ? <StepGroup steps={steps} /> : null}
      {results.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {results.map((r) => (
            <li key={r.key} className="inline-flex max-w-full items-center gap-1.5 rounded-chip border border-rule bg-surface px-2.5 py-1 text-caption">
              <Layers className="size-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="truncate">{r.title}</span>
              {countOf(r) !== null ? <span className="num text-ink-muted">{countOf(r)}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {card ? (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1.5">
          <ConfirmCard compact event={card} state={call.run.confirms[card.id]} onDecide={(d) => call.decide(card, d)} />
          {open ? <p className="px-1 text-caption text-ink-muted">{t("sayYes")}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
