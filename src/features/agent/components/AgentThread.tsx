"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Markdown } from "@/components/markdown/Markdown";
import { Button } from "@/components/ui/button";
import type { ConfirmEvent, StepEvent } from "../events";
import { ConfirmCard } from "./ConfirmCard";
import { AgentBeam } from "./fx/AgentBeam";
import { AgentAvatar } from "./identity/AgentAvatar";
import { ResultCard } from "./ResultCard";
import { StepGroup } from "./StepGroup";
import { type AgentItem, type ConfirmState, STALE } from "./useAgentRun";

type Props = {
  items: AgentItem[];
  confirms: Record<string, ConfirmState>;
  sample: boolean;
  onSend: (text: string) => void;
  onDecide: (event: ConfirmEvent, decision: "confirm" | "cancel") => void;
  onRetry: () => void;
  // a run is going: the latest reply's avatar works
  busy?: boolean;
};

type Block = { key: string; item: AgentItem } | { key: string; steps: StepEvent[] };

// Runs of consecutive steps become one timeline; everything else renders
// as its own block, in order.
function blocks(items: AgentItem[]): Block[] {
  const out: Block[] = [];
  for (const item of items) {
    const last = out.at(-1);
    if (item.type === "step") {
      if (last && "steps" in last) last.steps.push(item);
      else out.push({ key: item.key, steps: [item] });
    } else out.push({ key: item.key, item });
  }
  return out;
}

export function AgentThread({ items, confirms, sample, onSend, onDecide, onRetry, busy = false }: Props) {
  const t = useTranslations("agent");
  const all = blocks(items);
  const lastMessageKey = [...all].reverse().find((b) => "item" in b && b.item.type === "message")?.key;
  return (
    <ol className="grid content-start gap-5" aria-live="polite">
      {all.map((block) => {
        if ("steps" in block) return <li key={block.key}><StepGroup steps={block.steps} /></li>;
        const item = block.item;
        switch (item.type) {
          case "user":
            return <li key={block.key} className="agent-rise h-fit min-w-12 max-w-[75%] justify-self-end rounded-card rounded-br-md bg-ink px-3.5 py-2.5 text-body break-words whitespace-pre-wrap text-paper">{item.text}</li>;
          case "message":
            return (
              <li key={block.key} className="flex min-w-0 items-start gap-3">
                <AgentAvatar size={28} state={busy && block.key === lastMessageKey ? "working" : "default"} className="mt-0.5 shrink-0" />
                <Markdown animate text={item.text} className="min-w-0 flex-1 text-lead leading-relaxed text-ink" />
              </li>
            );
          case "question":
            return (
              <li key={block.key} className={`agent-rise grid ${item.text ? "gap-3" : "-mt-2"}`}>
                {/* an empty question is next steps after a reply: chips only */}
                {item.text ? <p className="text-lead text-ink">{item.text}</p> : null}
                <div className="flex flex-wrap gap-2">{item.chips.map((chip) => <Button key={chip} variant="chip" size="sm" onClick={() => onSend(chip)}>{chip}</Button>)}</div>
              </li>
            );
          case "result":
            if ("items" in item && item.items.length === 0) return null;
            return <li key={block.key}><ResultCard result={item} sample={sample} /></li>;
          case "confirm":
            // the beam rides the card while it waits for an answer
            return <li key={block.key}><AgentBeam active={(confirms[item.id] ?? "open") === "open"} radius={20}><ConfirmCard event={item} state={confirms[item.id]} onDecide={(d) => onDecide(item, d)} /></AgentBeam></li>;
          case "error":
            return (
              <li key={block.key} className="agent-rise flex flex-wrap items-center gap-3 text-small text-failure">
                <AlertTriangle className="size-4" aria-hidden="true" />{item.message === STALE ? t("error.stale") : t("error.line")}
                {item.retryable ? <Button variant="ghost" size="sm" onClick={onRetry}>{t("error.retry")}</Button> : null}
              </li>
            );
          default:
            return null;
        }
      })}
    </ol>
  );
}
