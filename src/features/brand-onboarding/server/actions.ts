"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { brands, campaigns } from "@/db/schema";
import { updateTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { getViewer } from "@/features/auth/server/session";
import { generateCampaignDraft } from "@/features/campaigns/server/brief-ai";
import { DAY_MS, DEFAULT_TARGET_REGIONS, STARTER_CAMPAIGN_SUFFIX, STARTER_FEE_CENTS, STARTER_POST_DEADLINE_DAYS } from "../constants";
import {
  type ActionResult, type AnalyzeResultDto, type CompleteResultDto, type ProfileInput, profileSchema, type WebsiteInput, websiteSchema,
} from "../schemas";
import { generateBrandProfile } from "./profile-ai";
import { type BrandOnboardingRow, emailDomainOf, getBrandOnboardingRow, isPlaceholderCompany } from "./queries";
import { readWebsite } from "./site-reader";

const NOT_SIGNED_IN = "Sign in as a brand to continue onboarding.";
const GENERIC = "Something went wrong on our side. Nothing was saved — please try again.";

function firstIssue(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Invalid input";
}

// The viewer's own brand row, or null (no session, a creator, a deleted row).
async function ownBrandRow(): Promise<(BrandOnboardingRow & { ownerUserId: string }) | null> {
  const viewer = await getViewer();
  if (!viewer?.brand) return null;
  const row = await getBrandOnboardingRow(viewer.brand.id);
  return row ? { ...row, ownerUserId: viewer.userId } : null;
}

// The brand profile is read by the shell, the campaigns and the marketplace fit.
function dropCaches(row: { brandId: string; ownerUserId: string }) {
  updateTags(tagsForMutation("brand-profile", { brandId: row.brandId, userIds: [row.ownerUserId] }));
}

// "use server" files only export async functions, so this stays local.
function starterCampaignName(company: string): string {
  return `${company} ${STARTER_CAMPAIGN_SUFFIX}`;
}

async function analyze(row: BrandOnboardingRow, url: string): Promise<AnalyzeResultDto> {
  const read = await readWebsite(url);
  if (!read.ok) console.warn("[brand-onboarding] site read failed, template from the company name", { brandId: row.brandId, url, reason: read.reason });
  const companyIsPlaceholder = isPlaceholderCompany(row.company, row.ownerEmail);
  const generated = await generateBrandProfile({
    summary: read.ok ? read.summary : null,
    company: row.company,
    companyIsPlaceholder,
    emailDomain: emailDomainOf(row.ownerEmail),
    url,
  });
  const { profile, industries, generatedWith } = generated;
  await getDb()
    .update(brands)
    .set({
      company: companyIsPlaceholder ? profile.company : row.company,
      website: url,
      valueProp: profile.valueProp,
      icps: profile.icps,
      targetIndustries: industries,
      targetRegions: row.targetRegions.length > 0 ? row.targetRegions : [...DEFAULT_TARGET_REGIONS],
      websiteSummary: read.ok ? read.summary : null,
    })
    .where(eq(brands.id, row.brandId));
  return { url, read: read.ok, generatedWith };
}

// Step 1: read the site, write the draft profile, persist it on the brand.
export async function analyzeWebsite(input: WebsiteInput): Promise<ActionResult<AnalyzeResultDto>> {
  const parsed = websiteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    const row = await ownBrandRow();
    if (!row) return { ok: false, error: NOT_SIGNED_IN };
    const data = await analyze(row, parsed.data.url);
    dropCaches(row);
    revalidatePath("/onboarding/brand", "layout");
    return { ok: true, data };
  } catch (error) {
    console.error("[brand-onboarding] analyzeWebsite failed", { url: input.url, error });
    return { ok: false, error: GENERIC };
  }
}

// One "{Company} creator brief" per brand: re-running onboarding reuses it.
async function ensureStarterCampaign(row: BrandOnboardingRow, profile: ProfileInput): Promise<CompleteResultDto> {
  const db = getDb();
  const name = starterCampaignName(row.company);
  const [existing] = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(and(eq(campaigns.brandId, row.brandId), eq(campaigns.name, name)))
    .limit(1);
  if (existing) return { campaignId: existing.id, created: false, generatedWith: "existing" };

  const { draft, generatedWith } = await generateCampaignDraft({
    brand: {
      id: row.brandId,
      company: row.company,
      website: row.website,
      valueProp: profile.valueProp,
      icps: profile.icps,
      targetIndustries: row.targetIndustries,
      targetRegions: row.targetRegions,
      walletCents: 0,
    },
    prompt: null,
  });
  const [created] = await db
    .insert(campaigns)
    .values({
      brandId: row.brandId,
      name,
      description: draft.description,
      status: "active",
      openToApplications: true,
      postDeadline: new Date(Date.now() + STARTER_POST_DEADLINE_DAYS * DAY_MS),
      defaultFeeCents: STARTER_FEE_CENTS,
      brief: draft.brief,
      source: generatedWith === "ai" ? "ai" : "manual",
      sourceUrl: row.website,
    })
    .returning({ id: campaigns.id });
  return { campaignId: created.id, created: true, generatedWith };
}

// Step 2: save the edits, make sure the starter campaign exists, mark the
// brand onboarded. Idempotent: a second run updates the profile and reuses
// the campaign.
export async function completeOnboarding(input: ProfileInput): Promise<ActionResult<CompleteResultDto>> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    const row = await ownBrandRow();
    if (!row) return { ok: false, error: NOT_SIGNED_IN };
    const db = getDb();
    await db.update(brands).set({ valueProp: parsed.data.valueProp, icps: parsed.data.icps }).where(eq(brands.id, row.brandId));
    const result = await ensureStarterCampaign(row, parsed.data);
    if (!row.onboarded) await db.update(brands).set({ onboardingCompletedAt: new Date() }).where(eq(brands.id, row.brandId));
    dropCaches(row);
    revalidatePath("/brand", "layout");
    return { ok: true, data: result };
  } catch (error) {
    console.error("[brand-onboarding] completeOnboarding failed", { error });
    return { ok: false, error: GENERIC };
  }
}
