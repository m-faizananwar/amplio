import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { baseColumns } from "../columns";
import { brands } from "./brands";
import { creators } from "./creators";

export const campaignStatus = pgEnum("campaign_status", ["draft", "active", "completed"]);
export const campaignSource = pgEnum("campaign_source", ["manual", "ai", "link", "team"]);

// The brief editor's exact field set.
export type BriefAngle = { angle: string; hook: string; direction: string; example: string };
export type Brief = {
  whatToTell: string;
  targetIndustries: string[];
  targetGeos: string[];
  tone: string;
  do: string[];
  avoid: string[];
  links: string[];
  angles: BriefAngle[];
};

export const campaigns = pgTable(
  "campaigns",
  {
    ...baseColumns,
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    status: campaignStatus("status").notNull().default("draft"),
    openToApplications: boolean("open_to_applications").notNull().default(true),
    postDeadline: timestamp("post_deadline", { withTimezone: true }),
    defaultFeeCents: integer("default_fee_cents").notNull().default(0),
    brief: jsonb("brief").$type<Brief>().notNull(),
    // How the campaign was created (the chooser's three cards) and what fed it.
    source: campaignSource("source").notNull().default("manual"),
    sourcePrompt: text("source_prompt"),
    sourceUrl: text("source_url"),
  },
  (t) => [index("campaigns_brand_id_idx").on(t.brandId), index("campaigns_status_idx").on(t.status)],
);

export const shortlist = pgTable(
  "shortlist",
  {
    ...baseColumns,
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("shortlist_brand_creator_idx").on(t.brandId, t.creatorId),
    index("shortlist_creator_id_idx").on(t.creatorId),
  ],
);
