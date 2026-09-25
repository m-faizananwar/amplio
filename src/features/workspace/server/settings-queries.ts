import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, creators, users } from "@/db/schema";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";
import { DEMO_DOMAINS } from "@/features/auth/constants";
import { isSeededEmail } from "@/lib/seeded";
import { profileSource, type ProfileSource } from "@/lib/profile-source";

export type BrandSettings = {
  company: string;
  website: string;
  valueProp: string;
  targetIndustries: string[];
  targetRegions: string[];
  owner: { name: string; email: string };
  icps: Array<{ title: string; description: string }>;
};

async function loadBrandSettings(brandId: string): Promise<BrandSettings | null> {
  const [row] = await getDb()
    .select({ brand: brands, firstName: users.firstName, lastName: users.lastName, email: users.email })
    .from(brands)
    .innerJoin(users, eq(users.id, brands.ownerUserId))
    .where(eq(brands.id, brandId));
  if (!row) return null;
  return {
    company: row.brand.company,
    website: row.brand.website ?? "",
    valueProp: row.brand.valueProp ?? "",
    targetIndustries: row.brand.targetIndustries,
    targetRegions: row.brand.targetRegions,
    owner: { name: `${row.firstName} ${row.lastName}`, email: row.email },
    icps: row.brand.icps,
  };
}

export type CreatorSettings = {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  linkedinUrl: string;
  industries: string[];
  priceCents: number;
  handle: string;
  xHandle: string;
  payout: { method: "stripe" | "bank" | null; accountHolder: string; ibanLast4: string };
  // The onboarding fields, so Settings edits exactly what onboarding created.
  country: string;
  bundles: Array<{ posts: number; totalCents: number }>;
  followers: number;
  engagementRate: number;
  /** Where the profile figures came from (Settings › LinkedIn says so). */
  profileSource: ProfileSource;
  professional: {
    legalCountry: string | null;
    registeredBusiness: boolean;
    legalName: string;
    legalAddress: string;
    taxAcknowledged: boolean;
    invoicingAuthorized: boolean;
  };
};

async function loadCreatorSettings(creatorId: string): Promise<CreatorSettings | null> {
  const [row] = await getDb()
    .select({ creator: creators, firstName: users.firstName, lastName: users.lastName, email: users.email })
    .from(creators)
    .innerJoin(users, eq(users.id, creators.userId))
    .where(eq(creators.id, creatorId));
  if (!row) return null;
  return {
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    headline: row.creator.headline,
    linkedinUrl: row.creator.linkedinUrl,
    industries: row.creator.industries,
    priceCents: row.creator.priceCents,
    handle: row.creator.handle,
    xHandle: row.creator.xHandle ?? "",
    payout: {
      method: row.creator.payoutMethod === "stripe" || row.creator.payoutMethod === "bank" ? row.creator.payoutMethod : null,
      accountHolder: row.creator.payoutAccountHolder ?? "",
      ibanLast4: row.creator.payoutIbanLast4 ?? "",
    },
    country: row.creator.country,
    bundles: row.creator.bundles,
    followers: row.creator.followers,
    engagementRate: row.creator.engagementRate,
    profileSource: profileSource({ seeded: isSeededEmail(row.email, DEMO_DOMAINS), followers: row.creator.followers }),
    professional: {
      legalCountry: row.creator.legalCountry,
      registeredBusiness: row.creator.registeredBusiness ?? false,
      legalName: row.creator.legalName ?? "",
      legalAddress: row.creator.legalAddress ?? "",
      taxAcknowledged: row.creator.taxAcknowledged ?? false,
      invoicingAuthorized: row.creator.invoicingAuthorized ?? false,
    },
  };
}

// Settings forms: only their own save dirties them.
export function getBrandSettings(brandId: string) {
  return cachedRead(loadBrandSettings, ["brand-settings"], { tags: [tag.brandSettings(brandId)] })(brandId);
}

export function getCreatorSettings(creatorId: string) {
  return cachedRead(loadCreatorSettings, ["creator-settings"], { tags: [tag.creatorOverview(creatorId)] })(creatorId);
}
