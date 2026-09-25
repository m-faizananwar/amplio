// The template profile: what step 2 shows when Claude is not available or
// the site could not be read. Pure — builds text from whatever was fetched
// (title, description, headings) and otherwise from the company name.
import {
  DEFAULT_TARGET_INDUSTRIES, ICP_COUNT, INDUSTRY_KEYWORDS, INFERRED_INDUSTRIES_MAX, INFERRED_INDUSTRIES_MIN, VALUE_PROP_MAX_CHARS,
} from "../constants";
import type { GeneratedProfile, Icp, WebsiteSummaryDto } from "../schemas";

export type ProfileSource = {
  summary: Omit<WebsiteSummaryDto, "fetchedAt"> | null;
  // The company as registered (possibly the placeholder derived from the email domain).
  company: string;
  companyIsPlaceholder: boolean;
  emailDomain: string;
  url: string;
  // the language the brand works in: the draft is written in it
  language?: "en" | "fr";
};

const TITLE_SEPARATORS = /\s*[|–—·]\s*|:\s+|\s+-\s+/;
const HEADINGS_IN_SENTENCE = 3;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function endSentence(text: string): string {
  const clean = text.trim().replace(/[.!?…]+$/, "");
  return `${clean}.`;
}

const COMPANY_WORDS_MAX = 4;

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").split(".")[0] ?? "";
  } catch {
    return "";
  }
}

// "Vercel: Build and deploy…" → "Vercel"; "Agentic Infrastructure - Vercel"
// with host vercel.com → "Vercel". The segment naming the host wins, then
// the first short segment.
export function companyFromTitle(title: string, host = ""): string | null {
  const segments = title.split(TITLE_SEPARATORS).map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return null;
  const label = host.toLowerCase();
  const named = label ? segments.find((s) => s.toLowerCase().replace(/[^a-z0-9]/g, "").includes(label)) : undefined;
  const pick = named ?? segments[0];
  return pick.split(/\s+/).length <= COMPANY_WORDS_MAX ? pick : null;
}

export function companyFromDomain(emailDomain: string): string {
  const label = emailDomain.split(".")[0] ?? "";
  return label ? capitalize(label) : "Your company";
}

// A host label that can stand in as a brand name: "acme" yes,
// "this-host-does-not-exist-9f3k2" no.
const NAME_LIKE_LABEL = /^[a-z]{2,20}$/i;

export function resolveCompany(source: ProfileSource): string {
  if (!source.companyIsPlaceholder && source.company.trim()) return source.company.trim();
  const host = hostLabel(source.url);
  const fromTitle = source.summary ? companyFromTitle(source.summary.title, host) : null;
  if (fromTitle) return fromTitle;
  if (NAME_LIKE_LABEL.test(host)) return companyFromDomain(host);
  return source.company.trim() || companyFromDomain(source.emailDomain);
}

// 2–3 industries by keyword hits over the fetched text; B2B / SaaS fill in.
export function inferIndustries(text: string): string[] {
  const haystack = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
  const scored = INDUSTRY_KEYWORDS.map(({ industry, keywords }) => ({
    industry,
    hits: keywords.reduce((sum, keyword) => sum + (haystack.split(keyword).length - 1), 0),
  }))
    .filter((entry) => entry.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, INFERRED_INDUSTRIES_MAX)
    .map((entry) => entry.industry);
  const filled = [...scored];
  for (const fallback of DEFAULT_TARGET_INDUSTRIES) {
    if (filled.length >= INFERRED_INDUSTRIES_MIN) break;
    if (!filled.includes(fallback)) filled.push(fallback);
  }
  return filled;
}

function valuePropFrom(company: string, source: ProfileSource, industries: string[]): string {
  const summary = source.summary;
  const description = summary?.description.trim();
  const headings = summary?.headings.slice(0, HEADINGS_IN_SENTENCE) ?? [];
  const sentences = [
    description
      ? `${company} is described on its website as: ${endSentence(description)}`
      : `${company} is the company behind ${source.url}, and this draft was prepared from its name because the site could not be read.`,
    headings.length > 0 ? `The site leads with ${headings.map((h) => `"${h}"`).join(", ")}.` : null,
    `It is aimed at business buyers in ${industries.join(", ")} who evaluate tools and services like this on LinkedIn.`,
    `Creators will present it through their own experience and keep every claim to what ${company} states publicly.`,
    "Edit this text so it reads the way your team describes the product, then continue.",
  ].filter((s): s is string => Boolean(s));
  const text = sentences.join(" ");
  return text.length <= VALUE_PROP_MAX_CHARS ? text : `${text.slice(0, VALUE_PROP_MAX_CHARS - 1).trimEnd()}…`;
}

function icpsFrom(company: string, industries: string[]): Icp[] {
  const focus = industries[0] ?? "B2B";
  return [
    {
      title: `Founder / CEO of an early-stage ${focus} company`,
      description: `Runs a 10–50 person team that has outgrown its first tools and needs a partner it can trust on ${focus}. Short on time, allergic to generic pitches, and wants to hear how ${company} fits a company at their stage from someone who has used it.`,
    },
    {
      title: "Head of Marketing / Growth at a scale-up",
      description: `Owns pipeline and brand at a 50–500 person company and follows creators for practical, tested advice. Wants a clear picture of what ${company} changes day to day, what it costs, and where it does not fit — not a feature list.`,
    },
    {
      title: "Operations or Product lead at a mid-market company",
      description: `Evaluates vendors for a team of specialists and cares about implementation effort, security and ownership. Looks for honest walkthroughs of ${company} from peers before opening a conversation with sales.`,
    },
  ].slice(0, ICP_COUNT);
}

export function textForInference(source: ProfileSource): string {
  const summary = source.summary;
  return summary ? [summary.title, summary.description, ...summary.headings].join(" ") : "";
}

export function buildTemplateProfile(source: ProfileSource): { profile: GeneratedProfile; industries: string[] } {
  const company = resolveCompany(source);
  const industries = inferIndustries(textForInference(source));
  return { profile: { company, valueProp: valuePropFrom(company, source, industries), icps: icpsFrom(company, industries) }, industries };
}
