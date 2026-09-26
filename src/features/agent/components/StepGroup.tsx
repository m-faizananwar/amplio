"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AgentBeam } from "./fx/AgentBeam";
import { AgentOrb } from "./fx/AgentOrb";
import type { StepEvent } from "../events";

// Consecutive steps as one timeline, folded under "Worked for N steps" once
// they have all settled. Each row opens to its receipt: what went in, what
// came out ("France · B2B · ≤ €500 → 7 match").
export function StepGroup({ steps }: { steps: StepEvent[] }) {
  const t = useTranslations("agent.steps");
  const running = steps.some((s) => s.status === "running");
  const [open, setOpen] = useState(true);
  const shown = running || open;
  return (
    <div className="grid gap-1">
      {running ? null : (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={shown} className="inline-flex w-fit items-center gap-1.5 rounded-control px-1 text-small text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-money">
          <ChevronDown className={`size-3.5 transition-transform duration-(--duration-fast) ${shown ? "" : "-rotate-90"}`} aria-hidden="true" />
          {t("worked", { count: steps.length })}
        </button>
      )}
      {shown ? <ol className="grid gap-0.5 border-l border-rule pl-3">{steps.map((s) => <StepRow key={s.id} step={s} />)}</ol> : null}
    </div>
  );
}

function StepRow({ step }: { step: StepEvent }) {
  const t = useTranslations("agent.steps");
  const [open, setOpen] = useState(false);
  const receipt = step.input || step.output;
  return (
    <li className="agent-rise">
      <AgentBeam active={step.status === "running"} radius={10} size="sm">
        <button type="button" disabled={!receipt} onClick={() => setOpen((v) => !v)} aria-expanded={receipt ? open : undefined} className="flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-left text-body outline-none enabled:hover:bg-well focus-visible:ring-2 focus-visible:ring-money">
          <span className="grid size-5 shrink-0 place-items-center">
            {step.status === "running" ? <AgentOrb size={20} state={step.tool.includes("search") ? "searching" : "working"} /> : step.status === "done" ? <Check className="size-4 text-money" aria-hidden="true" /> : <X className="size-4 text-failure" aria-hidden="true" />}
          </span>
          <span className={step.status === "failed" ? "text-failure" : "text-ink"}>{step.label}</span>
          {step.status === "running" ? <span className="sr-only">{t("running")}</span> : null}
          {step.status === "failed" ? <span className="sr-only">{t("failed")}</span> : null}
          {step.output && !open ? <span className="ml-auto truncate pl-3 text-small text-ink-muted">{step.output}</span> : null}
        </button>
      </AgentBeam>
      {open && receipt ? (
        <dl className="num mb-1 ml-9 grid gap-0.5 rounded-control bg-paper px-3 py-2 text-caption">
          {step.input ? <div className="flex gap-2"><dt className="w-14 shrink-0 text-ink-muted">{t("input")}</dt><dd className="text-ink">{step.input}</dd></div> : null}
          {step.output ? <div className="flex gap-2"><dt className="w-14 shrink-0 text-ink-muted">{t("output")}</dt><dd className="text-ink">→ {step.output}</dd></div> : null}
        </dl>
      ) : null}
    </li>
  );
}
