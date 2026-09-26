import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brandLogos, brands, users } from "@/db/schema";
import type { OnboardingProfileDto } from "../schemas";
import { companyFromDomain } from "./profile-template";

export type BrandOnboardingRow = OnboardingProfileDto & { ownerEmail: string };

function toDto(row: typeof brands.$inferSelect): OnboardingProfileDto {
  return {
    brandId: row.id,
    company: row.company,
    website: row.website,
    valueProp: row.valueProp ?? "",
    icps: row.icps.map((icp) => ({ title: icp.title, description: icp.description })),
    targetIndustries: row.targetIndustries,
    targetRegions: row.targetRegions,
    websiteSummary: row.websiteSummary
      ? { title: row.websiteSummary.title, description: row.websiteSummary.description, headings: [...row.websiteSummary.headings], fetchedAt: row.websiteSummary.fetchedAt }
      : null,
    onboarded: Boolean(row.onboardingCompletedAt),
  };
}

async function selectBrandRow(brandId: string) {
  const [row] = await getDb()
    .select({ brand: brands, ownerEmail: users.email })
    .from(brands)
    .innerJoin(users, eq(users.id, brands.ownerUserId))
    .where(eq(brands.id, brandId));
  return row ?? null;
}

// Actions use this: the DTO plus the owner's email (placeholder-company check).
export async function getBrandOnboardingRow(brandId: string): Promise<BrandOnboardingRow | null> {
  const row = await selectBrandRow(brandId);
  return row ? { ...toDto(row.brand), ownerEmail: row.ownerEmail } : null;
}

// Pages call this: null means "could not load" (logged), never a throw.
export async function loadOnboardingProfile(brandId: string): Promise<OnboardingProfileDto | null> {
  try {
    const row = await selectBrandRow(brandId);
    return row ? toDto(row.brand) : null;
  } catch (error) {
    console.error("[brand-onboarding] loadOnboardingProfile failed", { brandId, error });
    return null;
  }
}

export function emailDomainOf(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

// Registration names the brand after the email domain ("Gmail", "Acme") until
// onboarding replaces it with the name read from the site.
export function isPlaceholderCompany(company: string, email: string): boolean {
  const trimmed = company.trim().toLowerCase();
  if (!trimmed) return true;
  if (trimmed.endsWith("'s company")) return true;
  return trimmed === companyFromDomain(emailDomainOf(email)).toLowerCase();
}

// The brand's logo data URL, or null: none uploaded, or a database that
// doesn't have the brand_logos table yet (read-only fallback, never throws).
export async function getBrandLogo(brandId: string): Promise<string | null> {
  try {
    const [row] = await getDb().select({ dataUrl: brandLogos.dataUrl }).from(brandLogos).where(eq(brandLogos.brandId, brandId)).limit(1);
    return row?.dataUrl ?? null;
  } catch (error) {
    console.warn("[brand-onboarding] brand logo unavailable", { brandId, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}
