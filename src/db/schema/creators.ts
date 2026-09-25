import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { baseColumns } from "../columns";
import { users } from "./users";

export type CreatorBundle = { posts: number; totalCents: number };
// Percentages summing to ~100, e.g. { Marketing: 48, Founders: 29, ... }
export type AudienceMix = Record<string, number>;

export const creators = pgTable(
  "creators",
  {
    ...baseColumns,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    linkedinUrl: text("linkedin_url").notNull(),
    headline: text("headline").notNull(),
    bio: text("bio").notNull().default(""),
    country: text("country").notNull(),
    industries: text("industries").array().notNull().default([]),
    followers: integer("followers").notNull().default(0),
    priceCents: integer("price_cents").notNull(),
    bundles: jsonb("bundles").$type<CreatorBundle[]>().notNull().default([]),
    medianViews: integer("median_views").notNull().default(0),
    engagementRate: real("engagement_rate").notNull().default(0),
    postsPerMonth: real("posts_per_month").notNull().default(0),
    audienceJobTitles: jsonb("audience_job_titles").$type<AudienceMix>().notNull().default({}),
    audienceSeniority: jsonb("audience_seniority").$type<AudienceMix>().notNull().default({}),
    avatarUrl: text("avatar_url").notNull(),
    // When the public LinkedIn profile was last read for real (Apify); null means
    // the card was entered by hand (the read failed or was skipped).
    linkedinReadAt: timestamp("linkedin_read_at", { withTimezone: true }),
    // Onboarding: "complete your professional information" (optional step) and completion.
    legalCountry: text("legal_country"),
    registeredBusiness: boolean("registered_business"),
    legalName: text("legal_name"),
    legalAddress: text("legal_address"),
    taxAcknowledged: boolean("tax_acknowledged").notNull().default(false),
    invoicingAuthorized: boolean("invoicing_authorized").notNull().default(false),
    onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
    // Settings › Profile / Payments (no rail behind them; the ledger is what moves).
    xHandle: text("x_handle"),
    payoutMethod: text("payout_method"),
    payoutAccountHolder: text("payout_account_holder"),
    payoutIbanLast4: text("payout_iban_last4"),
  },
  (t) => [
    uniqueIndex("creators_user_id_idx").on(t.userId),
    uniqueIndex("creators_handle_idx").on(t.handle),
    index("creators_followers_idx").on(t.followers),
  ],
);

export const creatorPosts = pgTable(
  "creator_posts",
  {
    ...baseColumns,
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    body: text("body").notNull(),
    impressions: integer("impressions").notNull().default(0),
    reactions: integer("reactions").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    reposts: integer("reposts").notNull().default(0),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("creator_posts_creator_id_idx").on(t.creatorId)],
);
