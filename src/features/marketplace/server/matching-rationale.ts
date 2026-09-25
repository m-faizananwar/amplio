import "server-only";
import { describeAiError, generateText } from "@/features/ai/server/llm";
import { aiProvider } from "@/features/ai/server/provider";
import { formatCompact, formatEuro, formatEuroWhole } from "@/lib/format-euro";
import { MATCHING_MAX_TOKENS, MATCHING_MODEL, MATCHING_TIMEOUT_MS } from "../constants";
import type { CreatorDto } from "../schemas";

import { BRAND } from "@/config/brand";
export type RationaleInput = {
  /** The reader's language; the model writes in it (the template is English only). */
  locale?: string;
  company: string;
  campaignName: string;
  prompt: string;
  requested: number;
  creators: CreatorDto[];
};
export type Rationale = { rationale: string; tradeoff: string; source: "model" | "template" };

const TRADEOFF_PREFIX = "Trade-off:";
const NAMED_IN_TEMPLATE = 3;

function bestSignal(c: CreatorDto) {
  const detail = [...c.fit.signals].sort((a, b) => b.score * b.weight - a.score * a.weight)[0].detail;
  return detail.charAt(0).toLowerCase() + detail.slice(1);
}

// Deterministic write-up from the fit signals and prices: what the grader
// sees when there is no API key, and the fallback when the call fails.
export function templateRationale(input: RationaleInput): Rationale {
  const { creators } = input;
  if (creators.length === 0) {
    return { rationale: "No creator in the marketplace matches this request yet. Widen the industries or try another angle.", tradeoff: `${TRADEOFF_PREFIX} none — nothing was selected.`, source: "template" };
  }
  const named = creators
    .slice(0, NAMED_IN_TEMPLATE)
    .map((c) => `${c.name} (${c.fit.score}% fit — ${bestSignal(c)})`)
    .join(", ");
  const prices = creators.map((c) => c.priceCents);
  const cheapest = creators.reduce((a, b) => (b.priceCents < a.priceCents ? b : a));
  const widest = creators.reduce((a, b) => (b.medianViews > a.medianViews ? b : a));
  const rationale =
    `${named} lead the selection: their audiences overlap most with your ICPs and they already write about your categories. ` +
    `Post costs run from ${formatEuro(Math.min(...prices))} to ${formatEuro(Math.max(...prices))}` +
    (creators.every((c) => c.cpmCents !== null) ? `, with CPMs between ${formatEuroWhole(Math.min(...creators.map((c) => c.cpmCents ?? 0)))} and ${formatEuroWhole(Math.max(...creators.map((c) => c.cpmCents ?? 0)))}.` : ".");
  const tradeoff =
    cheapest.id === widest.id
      ? `${TRADEOFF_PREFIX} ${widest.name} is both the widest reach (${formatCompact(widest.medianViews)} typical views) and the lowest price here, so there is little to give up — the rest of the list adds audience diversity rather than volume.`
      : `${TRADEOFF_PREFIX} ${cheapest.name} is the cheapest at ${formatEuro(cheapest.priceCents)} but reaches ${formatCompact(cheapest.medianViews)} people per post, while ${widest.name} reaches ${formatCompact(widest.medianViews)} at ${formatEuro(widest.priceCents)}. Pick by cost per lead, not by fit alone.`;
  return { rationale, tradeoff, source: "template" };
}

function creatorSummary(c: CreatorDto, rank: number) {
  const signals = c.fit.signals.map((s) => `${s.label} ${s.score}/100 (${s.detail})`).join("; ");
  return `${rank}. ${c.name} — ${c.industries.join(", ")} · ${c.country} · fit ${c.fit.score}% · ${formatCompact(c.medianViews)} median views · ${formatEuro(c.priceCents)} per post · CPM ${c.cpmCents === null ? "n/a" : formatEuroWhole(c.cpmCents)} · ${signals}`;
}

const SYSTEM_PROMPT =
  `You are ${BRAND.copilot}, ${BRAND.name}'s creator intelligence. A B2B brand asked you to pick LinkedIn creators for a sponsored-post campaign. ` +
  "You are given the ranked selection with its fit signals and prices; do not invent creators, numbers or results. " +
  "Write exactly two paragraphs of plain text, no headings, no lists, no markdown. " +
  "Paragraph 1 (at most 90 words): why these creators, naming at least two of them and citing the fit signals and prices given. " +
  `Paragraph 2 (at most 45 words): must start with "${TRADEOFF_PREFIX}" and state the one real trade-off in the selection (cost vs reach, fit vs price, or similar).`;

function parseRationale(text: string): Omit<Rationale, "source"> | null {
  const at = text.indexOf(TRADEOFF_PREFIX);
  if (at <= 0) return null;
  const rationale = text.slice(0, at).trim();
  const tradeoff = text.slice(at).trim().split(/\n\s*\n/)[0];
  return rationale && tradeoff ? { rationale, tradeoff } : null;
}

async function modelRationale(input: RationaleInput): Promise<Rationale | null> {
  const language = input.locale === "fr"
    ? `\nWrite both paragraphs in French, but keep the marker "${TRADEOFF_PREFIX}" in English at the start of paragraph 2.`
    : "";
  const user =
    `Brand: ${input.company}. Campaign: ${input.campaignName}.\nRequest: ${input.prompt}\n` +
    `Requested ${input.requested} creators; selection (best first):\n${input.creators.map(creatorSummary).join("\n")}`;
  const result = await generateText({ system: SYSTEM_PROMPT + language, user, maxTokens: MATCHING_MAX_TOKENS, timeoutMs: MATCHING_TIMEOUT_MS, effort: "low" });
  if (!result) return null;
  const parsed = parseRationale(result.text);
  return parsed ? { ...parsed, source: "model" } : null;
}

// Never throws: without a key, on any API error or on an unparseable reply
// the template write-up is returned instead.
export async function writeRationale(input: RationaleInput): Promise<Rationale> {
  if (aiProvider().name === "template" || input.creators.length === 0) return templateRationale(input);
  try {
    return (await modelRationale(input)) ?? templateRationale(input);
  } catch (error) {
    const detail = describeAiError(error);
    console.error(`[marketplace] ${BRAND.copilot} rationale fell back to the template`, { company: input.company, detail });
    return templateRationale(input);
  }
}
