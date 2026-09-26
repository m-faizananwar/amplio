import type { AgentEvent } from "./events";

// What a call says out loud, built from the same events the screen shows.
// Pure. Short, no ids, no links, no markdown, amounts as words a voice reads
// naturally ("615 euros", not "€615.00").
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const URL_RE = /\bhttps?:\/\/\S*[^\s.,!?)]/gi;
const MAX_SENTENCES = 2;
const CENTS = 100;

export function sayEuros(raw: string, locale: "en" | "fr"): string {
  return raw
    .replace(/€\s?(\d[\d,.\s  ]*\d|\d)/g, (_, n: string) => `${n} €`)
    .replace(/(\d[\d,.\s  ]*\d|\d)\s?€/g, (_, n: string) => {
      const clean = n.replace(/[\s  ]/g, "").replace(/[.,]00$/, "");
      return `${clean} ${locale === "fr" ? "euros" : "euros"}`;
    });
}

export function speakable(text: string, locale: "en" | "fr", maxSentences = MAX_SENTENCES): string {
  const plain = sayEuros(text, locale)
    .replace(URL_RE, "")
    .replace(UUID, "")
    .replace(/[*_#`>]+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();
  const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, maxSentences).join(" ");
}

// The spoken form of one turn: the question, or the confirm card read out and
// asked, or the reply; falling back to what the steps found.
export function speechFor(events: AgentEvent[], locale: "en" | "fr"): string {
  const fr = locale === "fr";
  const confirm = [...events].reverse().find((e) => e.type === "confirm");
  if (confirm && confirm.type === "confirm") {
    const money = confirm.facts.find((f) => typeof f.cents === "number" && f.cents > 0);
    const amount = money ? ` ${money.label}: ${sayEuros(`€${(money.cents ?? 0) / CENTS}`, locale)}.` : "";
    return `${speakable(confirm.title, locale, 1)}.${amount} ${fr ? "Je le fais ?" : "Shall I go ahead?"}`.replace(/\.\./g, ".");
  }
  // a question with no text is chips attached to the reply: the reply is what's said
  const question = [...events].reverse().find((e) => e.type === "question" && e.text.trim() !== "");
  if (question && question.type === "question") return speakable(question.text, locale, 1);
  const final = [...events].reverse().find((e) => e.type === "message" && e.final);
  if (final && final.type === "message" && final.text.trim()) return speakable(final.text, locale);
  return fr ? "C’est fait." : "Done.";
}
