"use server";

import { and, eq, isNull } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db";
import { creators } from "@/db/schema";
import { updateTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { getViewer } from "@/features/auth/server/session";
import { COUNTRY_CODES, WORKSPACE_AFTER_ONBOARDING } from "../constants";
import { normalizeLinkedinUrl } from "@/lib/linkedin-url";
import { type ImportedLinkedinProfile, importLinkedinProfile } from "./linkedin-import";
import {
  type ActionResult, type CardInput, type LinkedinInput, type PriceInput, type ProfessionalInput, cardSchema, linkedinSchema,
  priceSchema, professionalSchema,
} from "../schemas";

const NOT_CONFIGURED = "The database is not configured on this deployment.";
const NOT_SIGNED_IN = "Your session has expired. Sign in again to continue.";
const GENERIC = "Something went wrong on our side. Please try again.";

type Auth = { creatorId: string; userId: string };

async function requireCreator(): Promise<ActionResult<Auth>> {
  if (!isDbConfigured()) return { ok: false, error: NOT_CONFIGURED };
  const viewer = await getViewer();
  if (!viewer?.creator) return { ok: false, error: NOT_SIGNED_IN };
  return { ok: true, data: { creatorId: viewer.creator.id, userId: viewer.userId } };
}

// Every write is scoped to the creator row owned by the signed-in user.
function ownRow(auth: Auth) {
  return and(eq(creators.id, auth.creatorId), eq(creators.userId, auth.userId));
}

// The creator row is part of the viewer (the shell reads it) and of the public
// directory, so every step of onboarding drops both.
function dropCaches(auth: Auth) {
  updateTags(tagsForMutation("creator-profile", { creatorId: auth.creatorId, userIds: [auth.userId] }));
}

function firstIssue(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Invalid input";
}

const READ_FAILED = "We couldn't read that profile — enter it by hand.";

// The row already holds this profile's import: don't pay for a second read.
async function cachedImport(auth: Auth, url: string): Promise<ImportedLinkedinProfile | null> {
  const [row] = await getDb().select({ linkedinUrl: creators.linkedinUrl, readAt: creators.linkedinReadAt, followers: creators.followers, headline: creators.headline, country: creators.country, avatarUrl: creators.avatarUrl }).from(creators).where(ownRow(auth)).limit(1);
  if (!row?.readAt || normalizeLinkedinUrl(row.linkedinUrl) !== url) return null;
  return { name: "", headline: row.headline || null, followers: row.followers, countryCode: row.country || null, photoUrl: row.avatarUrl || null };
}

// Step 2: read the public LinkedIn profile once (Apify, pinned actor) and keep
// what it says on the creator row. A failed read keeps the URL and says so —
// the creator fills the card by hand; nothing is ever made up.
export async function readLinkedinProfile(input: LinkedinInput): Promise<ActionResult<ImportedLinkedinProfile>> {
  const auth = await requireCreator();
  if (!auth.ok) return auth;
  const parsed = linkedinSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const url = normalizeLinkedinUrl(parsed.data.linkedinUrl);
  try {
    const cached = await cachedImport(auth.data, url);
    if (cached) return { ok: true, data: cached };
    const read = await importLinkedinProfile(url);
    if (!read.ok) {
      // a failed read keeps the URL only: any earlier successful read (its
      // figures and its date) stays, so null keeps meaning "never read"
      await getDb().update(creators).set({ linkedinUrl: url }).where(ownRow(auth.data));
      dropCaches(auth.data);
      return { ok: false, error: READ_FAILED };
    }
    const p = read.profile;
    const country = p.countryCode && COUNTRY_CODES.find((c) => c === p.countryCode);
    await getDb()
      .update(creators)
      .set({
        linkedinUrl: url,
        // the card's "imported from your public LinkedIn on <date>" reads this
        linkedinReadAt: new Date(),
        ...(p.followers !== null ? { followers: p.followers } : {}),
        ...(p.headline ? { headline: p.headline } : {}),
        ...(country ? { country } : {}),
        ...(p.photoUrl ? { avatarUrl: p.photoUrl } : {}),
      })
      .where(ownRow(auth.data));
    dropCaches(auth.data);
    return { ok: true, data: p };
  } catch (error) {
    console.error("[creator-onboarding] readLinkedinProfile failed", { creatorId: auth.data.creatorId, error });
    return { ok: false, error: GENERIC };
  }
}

// Step 3: headline, country and up to three industries.
export async function saveCreatorCard(input: CardInput): Promise<ActionResult<CardInput>> {
  const auth = await requireCreator();
  if (!auth.ok) return auth;
  const parsed = cardSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    await getDb()
      .update(creators)
      .set({ headline: parsed.data.headline, country: parsed.data.country, industries: [...parsed.data.industries] })
      .where(ownRow(auth.data));
    dropCaches(auth.data);
    return { ok: true, data: parsed.data };
  } catch (error) {
    console.error("[creator-onboarding] saveCreatorCard failed", { creatorId: auth.data.creatorId, error });
    return { ok: false, error: GENERIC };
  }
}

// Step 4: net price per post and optional bundles.
export async function savePricing(input: PriceInput): Promise<ActionResult<PriceInput>> {
  const auth = await requireCreator();
  if (!auth.ok) return auth;
  const parsed = priceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    await getDb()
      .update(creators)
      .set({ priceCents: parsed.data.priceCents, bundles: parsed.data.bundles })
      .where(ownRow(auth.data));
    dropCaches(auth.data);
    return { ok: true, data: parsed.data };
  } catch (error) {
    console.error("[creator-onboarding] savePricing failed", { creatorId: auth.data.creatorId, error });
    return { ok: false, error: GENERIC };
  }
}

// Marks onboarding complete once; re-running the flow never moves the date.
async function markCompleted(auth: Auth) {
  await getDb()
    .update(creators)
    .set({ onboardingCompletedAt: new Date() })
    .where(and(ownRow(auth), isNull(creators.onboardingCompletedAt)));
  dropCaches(auth);
}

// Optional last screen: professional information, then complete.
export async function saveProfessionalInfo(input: ProfessionalInput): Promise<ActionResult<{ redirectTo: string }>> {
  const auth = await requireCreator();
  if (!auth.ok) return auth;
  const parsed = professionalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    await getDb()
      .update(creators)
      .set({
        legalCountry: parsed.data.legalCountry,
        registeredBusiness: parsed.data.registeredBusiness,
        legalName: parsed.data.legalName,
        legalAddress: parsed.data.legalAddress,
        taxAcknowledged: parsed.data.taxAcknowledged,
        invoicingAuthorized: parsed.data.invoicingAuthorized,
      })
      .where(ownRow(auth.data));
    dropCaches(auth.data);
    await markCompleted(auth.data);
    return { ok: true, data: { redirectTo: WORKSPACE_AFTER_ONBOARDING } };
  } catch (error) {
    console.error("[creator-onboarding] saveProfessionalInfo failed", { creatorId: auth.data.creatorId, error });
    return { ok: false, error: GENERIC };
  }
}

// "Go to my workspace — finish later": complete without professional info.
export async function completeOnboarding(): Promise<ActionResult<{ redirectTo: string }>> {
  const auth = await requireCreator();
  if (!auth.ok) return auth;
  try {
    await markCompleted(auth.data);
    return { ok: true, data: { redirectTo: WORKSPACE_AFTER_ONBOARDING } };
  } catch (error) {
    console.error("[creator-onboarding] completeOnboarding failed", { creatorId: auth.data.creatorId, error });
    return { ok: false, error: GENERIC };
  }
}
