import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { baseColumns } from "../columns";
import { creators } from "./creators";
import { users } from "./users";

export type BrandIcp = { title: string; description: string };
// What onboarding read from the brand's website.
export type WebsiteSummary = { title: string; description: string; headings: string[]; fetchedAt: string };

export const brands = pgTable(
  "brands",
  {
    ...baseColumns,
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    company: text("company").notNull(),
    website: text("website"),
    valueProp: text("value_prop"),
    icps: jsonb("icps").$type<BrandIcp[]>().notNull().default([]),
    targetIndustries: text("target_industries").array().notNull().default([]),
    targetRegions: text("target_regions").array().notNull().default([]),
    walletCents: integer("wallet_cents").notNull().default(0),
    pixelSiteKey: text("pixel_site_key").notNull(),
    websiteSummary: jsonb("website_summary").$type<WebsiteSummary>(),
    onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
    // Affiliate program: the creator whose Deal Link / referral link brought this brand in.
    referredByCreatorId: uuid("referred_by_creator_id").references(() => creators.id, { onDelete: "set null" }),
  },
  (t) => [
    uniqueIndex("brands_slug_idx").on(t.slug),
    index("brands_referred_by_creator_id_idx").on(t.referredByCreatorId),
    uniqueIndex("brands_pixel_site_key_idx").on(t.pixelSiteKey),
    index("brands_owner_user_id_idx").on(t.ownerUserId),
  ],
);

// A brand's logo: a small data URL (256px WebP or JPEG, ~20 KB) drawn in the
// browser. Its own table, so the brand rows every query selects don't change:
// reading it is optional and falls back to no logo.
export const brandLogos = pgTable(
  "brand_logos",
  {
    ...baseColumns,
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    dataUrl: text("data_url").notNull(),
  },
  (t) => [uniqueIndex("brand_logos_brand_id_idx").on(t.brandId)],
);
