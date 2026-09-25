// Template brief generator: the fallback when no AI key is configured. Builds
// a starter brief (what to tell, who it's for, the angles) from the
// brand's confirmed profile. Pure: no io.

export type TemplateIcp = { title: string; description: string };

export type TemplateInput = {
  company: string;
  valueProp: string | null;
  icps: TemplateIcp[];
  targetIndustries: string[];
  targetRegions: string[];
  website?: string | null;
  prompt?: string | null;
};

export type TemplateAngle = { angle: string; hook: string; direction: string; example: string };
export type TemplateBrief = {
  whatToTell: string;
  targetIndustries: string[];
  targetGeos: string[];
  tone: string;
  do: string[];
  avoid: string[];
  links: string[];
  angles: TemplateAngle[];
};
export type TemplateDraft = { name: string; description: string; brief: TemplateBrief };

export const DEFAULT_TONE = "Clear, useful and natural. Keep the creator's own voice rather than following a script.";
export const DEFAULT_DO = [
  "Use only the confirmed information about {Company}.",
  "Connect the product to a practical audience question.",
  "Disclose the sponsored partnership clearly.",
];
export const DEFAULT_AVOID = [
  "Do not invent customers, results, figures or features.",
  "Do not force an endorsement or promise outcomes.",
];

const NAME_MAX_CHARS = 48;
const ANGLE_COUNT = 3;

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : text).trim();
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function joinNatural(items: string[], fallback: string): string {
  return items.length > 0 ? items.join(", ") : fallback;
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").replace(/[.!?\s]+$/, "").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function defaultDoLines(company: string): string[] {
  return DEFAULT_DO.map((line) => line.replace("{Company}", company));
}

function whatToTell(input: TemplateInput): string {
  const described = input.valueProp
    ? `${input.company} is described by the company as ${lowerFirst(input.valueProp.trim())}`
    : `${input.company} has not written its value proposition yet — use only what the company confirms.`;
  const audience = `The intended audience is professionals connected to ${joinNatural(input.targetIndustries, "B2B")} in ${joinNatural(input.targetRegions, "Europe")}.`;
  const focus = input.prompt?.trim() ? ` Campaign focus: ${input.prompt.trim()}` : "";
  return `${described.replace(/\.?$/, ".")} ${audience} Introduce the product through your own expertise, adapt the angle to your audience, and keep every claim grounded in the confirmed company profile.${focus}`;
}

// Three angles, one per ICP. With fewer ICPs the generic angle fills in.
function angles(input: TemplateInput): TemplateAngle[] {
  const summary = input.valueProp ? firstSentence(input.valueProp) : `${input.company} — see the company profile.`;
  const icps = [...input.icps];
  while (icps.length < ANGLE_COUNT) {
    icps.push({ title: `professionals in ${joinNatural(input.targetIndustries, "B2B")}`, description: summary });
  }
  const [first, second, third] = icps;
  return [
    {
      angle: "A practical introduction",
      hook: `A question every ${first.title} ends up asking.`,
      direction: `Introduce ${input.company} through one practical question your audience (${first.title}) is already asking. Confirmed description: ${summary} Keep every claim to what the company states.`,
      example: `Sponsored partnership with ${input.company}, and a question I keep hearing from ${first.title}s: where does the time actually go? ${summary} Here is how I would use it.`,
    },
    {
      angle: `What changes for a ${second.title}`,
      hook: firstSentence(second.description),
      direction: `Explain what changes for a ${second.title} when ${input.company}'s approach is applied to their situation. Compare with how they do it today, without dunking on anyone.`,
      example: `${firstSentence(second.description)} I have watched this play out a dozen times. What ${input.company} changes is the sequence, not the effort. (Sponsored, and I'd say this anyway.)`,
    },
    {
      angle: "A concrete use case",
      hook: `The moment a ${third.title} realises the old way stopped working.`,
      direction: `Pick one concrete situation a ${third.title} recognises — ${firstSentence(third.description)} — and walk through it start to finish with ${input.company} in the loop. No invented figures.`,
      example: `Last quarter a ${third.title} told me: "${firstSentence(third.description)}" That is exactly the case ${input.company} is built for. Sponsored partnership; opinions mine.`,
    },
  ];
}

function campaignName(input: TemplateInput): string {
  const prompt = input.prompt?.trim();
  if (!prompt) return `${input.company} creator brief`;
  return `${input.company} — ${truncate(prompt.replace(/^i want to\s+/i, ""), NAME_MAX_CHARS)}`;
}

function description(input: TemplateInput): string {
  const prompt = input.prompt?.trim();
  if (prompt) return `${truncate(`Creators introduce ${input.company} to ${lowerFirst(prompt.replace(/^i want to\s+/i, ""))}`, NAME_MAX_CHARS * ANGLE_COUNT)}.`;
  return `Creators introduce ${input.company} to ${joinNatural(input.targetIndustries, "B2B")} professionals in ${joinNatural(input.targetRegions, "Europe")}.`;
}

export function buildTemplateDraft(input: TemplateInput): TemplateDraft {
  return {
    name: campaignName(input),
    description: description(input),
    brief: {
      whatToTell: whatToTell(input),
      targetIndustries: input.targetIndustries,
      targetGeos: input.targetRegions.length > 0 ? input.targetRegions : ["Europe"],
      tone: DEFAULT_TONE,
      do: defaultDoLines(input.company),
      avoid: [...DEFAULT_AVOID],
      links: input.website ? [input.website] : [],
      angles: angles(input),
    },
  };
}
