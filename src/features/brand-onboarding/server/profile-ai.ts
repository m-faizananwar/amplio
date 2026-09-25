import "server-only";
import { describeAiError, generateStructured } from "@/features/ai/server/llm";
import { aiProvider } from "@/features/ai/server/provider";
import { z } from "zod";
import { ICP_COUNT, PROFILE_AI_MAX_TOKENS, PROFILE_AI_TIMEOUT_MS } from "../constants";
import { type GeneratedProfile, generatedProfileSchema } from "../schemas";
import { buildTemplateProfile, inferIndustries, type ProfileSource, textForInference } from "./profile-template";

import { BRAND } from "@/config/brand";
export type GeneratedBrandProfile = { profile: GeneratedProfile; industries: string[]; generatedWith: "ai" | "template" };

// Wire schema for the model: no limits or transforms (JSON Schema cannot
// express them); the response is re-validated against generatedProfileSchema.
const aiOutputSchema = z.object({
  company: z.string(),
  valueProp: z.string(),
  icps: z.array(z.object({ title: z.string(), description: z.string() })),
});

const SYSTEM_PROMPT = `You write the onboarding profile for a brand joining ${BRAND.name}, a B2B LinkedIn creator marketplace. You get what was read from the company's website (title, meta description, main headings) plus the name it registered with. You return the company name, a value proposition and ${ICP_COUNT} ideal customer profiles (ICPs).

Rules:
- Use only what the website text and the registration say. Never invent customers, figures, awards or features. If the text is thin, stay general and say what the site states.
- "company" is the short brand name as the company writes it (no tagline, no legal suffix unless it is part of the name).
- "valueProp" is 4 to 6 sentences: what the company does, for whom, and how — the product, the buyer, the way it is delivered, the outcome the company claims. Third person, plain language, no marketing superlatives that the site does not use.
- "icps" is exactly ${ICP_COUNT} entries. Each title is a role plus a company type (for example "Founder / CEO of Early-Stage SaaS", "Product Director at Mid-Market B2B Company"). Each description is 3 to 4 sentences: what they own, the situation that makes them look for this product, what they are frustrated by, and why this company's approach fits.
- Write for a LinkedIn creator who will explain the product to that audience.`;

const LANGUAGE_NAME = { en: "English", fr: "French" } as const;

function userPrompt(source: ProfileSource): string {
  const summary = source.summary;
  return [
    `Write every field (valueProp, ICP titles and descriptions) in ${LANGUAGE_NAME[source.language ?? "en"]}. Keep the company name as the company writes it.`,
    `Registered company name: ${source.company}${source.companyIsPlaceholder ? " (placeholder derived from the email domain — replace it with the real name from the site)" : ""}`,
    `Email domain: ${source.emailDomain || "(unknown)"}`,
    `Website: ${source.url}`,
    summary
      ? [
          `Page title: ${summary.title || "(none)"}`,
          `Meta description: ${summary.description || "(none)"}`,
          `Main headings:\n${summary.headings.map((h) => `- ${h}`).join("\n") || "(none)"}`,
        ].join("\n")
      : "The website could not be read. Write a careful, general profile from the company name and domain only, and say so in the value proposition.",
  ].join("\n\n");
}

async function generateWithAi(source: ProfileSource): Promise<GeneratedProfile | null> {
  const result = await generateStructured({ system: SYSTEM_PROMPT, user: userPrompt(source), schema: aiOutputSchema, maxTokens: PROFILE_AI_MAX_TOKENS, timeoutMs: PROFILE_AI_TIMEOUT_MS });
  if (!result) return null;
  const parsed = generatedProfileSchema.safeParse(result.data);
  return parsed.success ? parsed.data : null;
}

// The resolved provider when a key is set; the template on any failure (no key,
// network, refusal, invalid JSON). Never throws: onboarding must not block
// on the model.
export async function generateBrandProfile(source: ProfileSource): Promise<GeneratedBrandProfile> {
  const fallback = () => ({ ...buildTemplateProfile(source), generatedWith: "template" as const });
  if (aiProvider().name === "template") return fallback();
  try {
    const profile = await generateWithAi(source);
    if (profile) {
      const industries = inferIndustries(`${textForInference(source)} ${profile.valueProp} ${profile.icps.map((i) => `${i.title} ${i.description}`).join(" ")}`);
      return { profile, industries, generatedWith: "ai" };
    }
    console.warn("[brand-onboarding] profile-ai returned no usable profile, using the template", { url: source.url });
  } catch (error) {
    const reason = describeAiError(error);
    console.error("[brand-onboarding] profile-ai failed, using the template", { url: source.url, reason, error });
  }
  return fallback();
}
