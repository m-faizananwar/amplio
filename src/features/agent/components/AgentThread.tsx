"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { ConfirmEvent, StepEvent } from "../events";
import { ConfirmCard } from "./ConfirmCard";
import { ResultCard } from "./ResultCard";
import { StepGroup } from "./StepGroup";
import type { AgentItem, ConfirmState } from "./useAgentRun";

type Props = {
  items: AgentItem[];
  confirms: Record<string, ConfirmState>;
  sample: boolean;
  onSend: (text: string) => void;
  onDecide: (event: ConfirmEvent, decision: "confirm" | "cancel") => void;
  onRetry: () => void;
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

export function AgentThread({ items, confirms, sample, onSend, onDecide, onRetry }: Props) {
  const t = useTranslations("agent");
  return (
    <ol className="grid gap-5" aria-live="polite">
      {blocks(items).map((block) => {
        if ("steps" in block) return <li key={block.key}><StepGroup steps={block.steps} /></li>;
        const item = block.item;
        switch (item.type) {
          case "user":
            return <li key={block.key} className="agent-rise justify-self-end rounded-card rounded-br-md bg-ink px-4 py-2.5 text-body text-paper">{item.text}</li>;
          case "message":
            return <li key={block.key} className="agent-message text-lead leading-relaxed text-ink">{item.text.split(/(\s+)/).map((w, i) => <span key={i} style={{ animationDelay: `${Math.min(i, 120) * 18}ms` }}>{w}</span>)}</li>;
          case "question":
            return (
              <li key={block.key} className="agent-rise grid gap-3">
                <p className="text-lead text-ink">{item.text}</p>
                <div className="flex flex-wrap gap-2">{item.chips.map((chip) => <Button key={chip} variant="chip" size="sm" onClick={() => onSend(chip)}>{chip}</Button>)}</div>
              </li>
            );
          case "result":
            return <li key={block.key}><ResultCard result={item} sample={sample} /></li>;
          case "confirm":
            return <li key={block.key}><ConfirmCard event={item} state={confirms[item.id]} onDecide={(d) => onDecide(item, d)} /></li>;
          case "error":
            return (
              <li key={block.key} className="agent-rise flex flex-wrap items-center gap-3 text-small text-failure">
                <AlertTriangle className="size-4" aria-hidden="true" />{t("error.line")}
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
