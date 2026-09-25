import { z } from "zod";
import { INDUSTRIES, REGIONS } from "./constants";

export const brandProfileSchema = z.object({
  company: z.string().trim().min(1, "Company name is required").max(120),
  website: z.string().trim().url("Enter a full URL, including https://").max(200).or(z.literal("")),
  valueProp: z.string().trim().max(2000),
});
export type BrandProfileInput = z.infer<typeof brandProfileSchema>;

// Settings › Company: name and website only, so this form never overwrites the
// value proposition (that is the onboarding profile's own save).
export const brandCompanySchema = brandProfileSchema.pick({ company: true, website: true });
export type BrandCompanyInput = z.infer<typeof brandCompanySchema>;

export const brandAudienceSchema = z.object({
  targetIndustries: z.array(z.enum(INDUSTRIES)).max(INDUSTRIES.length),
  targetRegions: z.array(z.enum(REGIONS)).max(REGIONS.length),
});
export type BrandAudienceInput = z.infer<typeof brandAudienceSchema>;

export const creatorProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  headline: z.string().trim().max(200),
  linkedinUrl: z.string().trim().url().max(200).or(z.literal("")),
  industries: z.array(z.enum(INDUSTRIES)).max(3, "Pick up to 3 industries"),
  priceCents: z.number().int().min(2000, "Minimum €20 per post").max(150000, "Platform limit is €1,500 per post"),
  xHandle: z.string().trim().max(40).regex(/^@?[A-Za-z0-9_]*$/, "Letters, digits and underscores only").or(z.literal("")),
});
export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;

// Settings › You: only the fields onboarding doesn't collect, saved on their
// own so this form can never overwrite the card or the price.
export const creatorIdentitySchema = creatorProfileSchema.pick({ firstName: true, lastName: true, xHandle: true });
export type CreatorIdentityInput = z.infer<typeof creatorIdentitySchema>;

const IBAN_MIN = 15;
const IBAN_MAX = 34;
export const payoutDetailsSchema = z.object({
  method: z.enum(["stripe", "bank"]),
  accountHolder: z.string().trim().max(120).or(z.literal("")),
  // Only the last 4 characters are stored; the rest never leaves the form.
  iban: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ""))
    .pipe(z.string().min(IBAN_MIN, "That IBAN looks too short").max(IBAN_MAX).or(z.literal(""))),
});
export type PayoutDetailsInput = z.infer<typeof payoutDetailsSchema>;

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
