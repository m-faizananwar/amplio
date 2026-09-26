import "server-only";
import { getTranslations } from "next-intl/server";
import { optionKey } from "@/lib/option-key";
import type { AgentEvent } from "../events";

// Step labels, fact labels and button words are written in English in the
// tools; this translates them for the viewer (messages/{en,fr}/agent.json,
// keyed by the English text's slug). Anything unlisted passes through.
export async function localizer(locale: "en" | "fr") {
  const t = await getTranslations({ locale, namespace: "agent.labels" });
  const tr = (text: string) => { const k = optionKey(text); return k && t.has(k) ? t(k) : text; };
  return (event: AgentEvent): AgentEvent => {
    if (event.type === "step") return { ...event, label: tr(event.label), output: event.output ? tr(event.output) : event.output };
    if (event.type === "confirm") return { ...event, confirmLabel: tr(event.confirmLabel), facts: event.facts.map((f) => ({ ...f, label: tr(f.label) })) };
    return event;
  };
}
