import { BRAND } from "@/config/brand";
// Template fallback for the voice layer: a small regex table that turns a
// transcript into an intent when no AI provider key is set. Pure.

export type GrammarIntent =
  | { tool: "navigate"; route: string }
  | { tool: "searchCreators"; industry?: string; country?: string; maxPriceEuros?: number; minPriceEuros?: number; query?: string }
  | { tool: "openCreator"; name: string }
  | { tool: "bookCreator"; name: string; posts: number }
  | { tool: "openCampaign"; name: string }
  | { tool: "approveDraft"; creatorName: string }
  | { tool: "requestChanges"; creatorName: string; note: string }
  | { tool: "topUp"; amountEuros: number }
  | { tool: "showResults"; campaign?: string }
  | { tool: "applyToCampaign"; name: string }
  | { tool: "submitDraft"; text: string }
  | { tool: "unknown"; reason: string };

const WORD_NUMBERS: Record<string, number> = { one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const ROUTE_WORDS = ["overview", "home", "dashboard", "creators", "marketplace", "matching", BRAND.copilot.toLowerCase(), "campaigns", "collaborations", "results", "messages", "billing", "wallet", "invite", "book a call", "integrations", "settings", "card", "my card", "opportunities", "analytics", "earnings", "affiliate", "links"];
const THOUSAND = 1000;

function clean(text: string) {
  return text.trim().replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
}

function amount(text: string) {
  const m = /(\d[\d,.]*)\s*(k)?\s*(€|eur|euros?)?/i.exec(text) ?? /(€|eur|euros?)\s*(\d[\d,.]*)/i.exec(text);
  if (!m) return null;
  const raw = (m[1] && /\d/.test(m[1]) ? m[1] : m[2]) ?? "";
  const n = Number(raw.replace(/[,.](?=\d{3}\b)/g, "").replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(/\dk/i.test(text.replace(/\s+/g, "")) || /\d\s*k\b/i.test(text) ? n * THOUSAND : n);
}

function count(text: string) {
  const m = /\b(\d+|one|a|an|two|three|four|five|six|seven|eight|nine|ten)\s+posts?\b/i.exec(text);
  if (!m) return 1;
  const w = m[1].toLowerCase();
  return WORD_NUMBERS[w] ?? Number(w) ?? 1;
}

function titleCase(s: string) {
  return s.split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function parseVoiceCommand(transcript: string): GrammarIntent {
  const t = clean(transcript);
  const lower = t.toLowerCase();
  let m: RegExpExecArray | null;

  if ((m = /^(?:top ?up|add|deposit|credit)(?: my)?(?: wallet| budget| balance)?(?: by| with)?\s+(.+)$/i.exec(t))) {
    const euros = amount(m[1]);
    if (euros) return { tool: "topUp", amountEuros: euros };
  }
  if ((m = /^(?:book|invite|hire)\s+(.+?)(?:\s+for\s+(.+?))?(?:\s+on\s+.+)?$/i.exec(t)) && !/campaign/i.test(m[1])) {
    return { tool: "bookCreator", name: titleCase(m[1]), posts: count(m[2] ?? "") };
  }
  if ((m = /^approve(?: the)?(?: draft)?(?: from| by| of)?\s+(.+?)(?:'s draft)?$/i.exec(t))) return { tool: "approveDraft", creatorName: titleCase(m[1]) };
  if ((m = /^(?:request changes|ask for changes|send back)(?: on| to| from| for)?(?: the draft)?(?: from| by| of)?\s+(.+?)(?:[:,]\s*|\s+(?:saying|say|note|because)\s+)(.+)$/i.exec(t))) {
    return { tool: "requestChanges", creatorName: titleCase(m[1]), note: m[2] };
  }
  if ((m = /^(?:request changes|ask for changes)(?: on| from| for)?(?: the draft)?(?: from| by| of)?\s+(.+)$/i.exec(t))) return { tool: "requestChanges", creatorName: titleCase(m[1]), note: "Please revise the draft." };
  if ((m = /^(?:open|show|go to)(?: the)?\s+(.+?)\s+campaign$/i.exec(t)) || (m = /^(?:open|show)(?: the)? campaign\s+(.+)$/i.exec(t))) return { tool: "openCampaign", name: m[1] };
  if ((m = /^(?:show(?: me)?|open|go to)(?: the)?\s+results(?:\s+(?:for|of)\s+(.+))?$/i.exec(t))) return { tool: "showResults", campaign: m[1] };
  if ((m = /^(?:apply(?: to| for)?|join)(?: the)?\s+(.+?)(?:\s+campaign)?$/i.exec(t))) return { tool: "applyToCampaign", name: m[1] };
  if ((m = /^(?:submit(?: my| the)? draft|send(?: my| the)? draft)(?:[:,]|\s+saying|\s+with)?\s*(.+)$/i.exec(t))) return { tool: "submitDraft", text: m[1] };
  if ((m = /^(?:find|search(?: for)?|show(?: me)?|look for)\s+(?:creators?|people|profiles)?\s*(.*)$/i.exec(t)) && /creator|fintech|under|below|over|above|in\s|€|eur/i.test(lower)) {
    const rest = m[1];
    const country = /\b(?:in|from)\s+(france|the uk|uk|germany|the us|us|usa|spain|netherlands|pakistan|india)\b/i.exec(rest)?.[1];
    const max = /\b(?:under|below|less than|max(?:imum)?|up to)\s+(.+?)(?:\s|$)/i.exec(rest);
    const min = /\b(?:over|above|more than|at least|min(?:imum)?)\s+(.+?)(?:\s|$)/i.exec(rest);
    const industry = /\b(?:in|about|on)\s+(fintech|saas|ai|marketing|sales|seo|outreach|crm|creative|productivity|healthtech|edtech|cybersecurity|growth|hr|e-?commerce|developer tools|data|customer support|design|real estate|legaltech|b2b|b2c)\b/i.exec(rest)?.[1];
    return {
      tool: "searchCreators",
      industry: industry ? titleCase(industry) : undefined,
      country: country ? country.replace(/^the /i, "") : undefined,
      maxPriceEuros: max ? (amount(max[1]) ?? undefined) : undefined,
      minPriceEuros: min ? (amount(min[1]) ?? undefined) : undefined,
    };
  }
  for (const word of ROUTE_WORDS) {
    if (new RegExp(`^(?:go to|open|show(?: me)?|take me to|navigate to)(?: the| my)?\\s+${word}$`, "i").test(t)) return { tool: "navigate", route: word };
  }
  if ((m = /^(?:open|show(?: me)?|find)\s+(?:creator|profile)\s+(.+)$/i.exec(t)) || (m = /^(?:open|show(?: me)?)\s+(.+?)(?:'s)?\s+(?:profile|card)$/i.exec(t))) return { tool: "openCreator", name: titleCase(m[1]) };
  // Bare "open Sarah Chen" once no route matched: a creator by name.
  if ((m = /^(?:open|show(?: me)?|find)\s+([a-z][a-z' -]{1,40})$/i.exec(t))) return { tool: "openCreator", name: titleCase(m[1]) };
  return { tool: "unknown", reason: `I didn't catch a command in “${t}”.` };
}
