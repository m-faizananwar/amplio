"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Stamp } from "@/components/graphics/Stamp";
import { Button } from "@/components/ui/button";
import type { ConfirmEvent } from "../events";
import type { ConfirmState } from "./useAgentRun";

// A change the agent won't make alone (money, a collaboration): the facts in
// mono, then Confirm (money blob) or the cancel the agent offered. Once
// confirmed it becomes a stamped receipt of what happened.
export function ConfirmCard({ event, state = "open", onDecide, big = false }: { event: ConfirmEvent; state?: ConfirmState; onDecide: (decision: "confirm" | "cancel") => void; big?: boolean }) {
  const t = useTranslations("agent.confirm");
  const settled = state === "done" || state === "cancelled";
  const money = event.facts.find((f) => f.cents !== undefined);
  return (
    <section aria-label={event.title} className={`agent-rise overflow-hidden rounded-card border bg-surface shadow-lift ${state === "done" ? "border-money/40" : "border-rule"} ${big ? "w-full max-w-md" : ""}`}>
      <header className={`flex items-center gap-3 px-4 py-3 ${state === "done" ? "bg-money-soft" : "bg-attention-soft"}`}>
        <span className={`grid size-8 shrink-0 place-items-center rounded-full ${state === "done" ? "bg-money text-surface" : "bg-attention text-surface"}`}><ShieldCheck className="size-4" aria-hidden="true" /></span>
        <div className="min-w-0">
          <p className="text-caption text-ink-muted">{t("title")}</p>
          <p className="truncate font-medium text-ink">{event.title}</p>
        </div>
      </header>
      <dl className="grid gap-1.5 px-4 py-3">
        {event.facts.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-small text-ink-muted">{f.label}</dt>
            <dd className={`text-right ${f.cents !== undefined ? "num font-medium text-ink" : "text-body"}`}>{f.value}</dd>
          </div>
        ))}
      </dl>
      <footer className="flex flex-wrap items-center gap-2 border-t border-rule px-4 py-3">
        {state === "done" ? (
          <span className="flex items-center gap-3"><Stamp>{t("done")}</Stamp>{money ? <span className="num text-small text-ink-muted">{money.label} · {money.value}</span> : null}</span>
        ) : state === "cancelled" ? (
          <span className="text-small text-ink-muted">{event.cancelLabel}</span>
        ) : (
          <>
            <Button variant="money" status={state === "working" ? "saving" : undefined} disabled={state === "working"} onClick={() => onDecide("confirm")}>{event.confirmLabel}</Button>
            <Button variant="ghost" disabled={state === "working" || settled} onClick={() => onDecide("cancel")}>{event.cancelLabel}</Button>
            {big ? <span className="text-small text-ink-muted">{t("sayYes")}</span> : null}
          </>
        )}
      </footer>
    </section>
  );
}
