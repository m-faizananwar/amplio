import "server-only";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, clicks, collaborationEvents, collaborations, creators, trackingLinks, users } from "@/db/schema";
import { allowedEvents } from "@/lib/collaboration-status";
import { PERFORMANCE_STATUSES } from "@/lib/collaboration-labels";
import { MAX_REVISION_ROUNDS } from "../constants";
import type { BriefDto, CollaborationDto, CollaborationEventDto, ViewerRole } from "../schemas";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Postgres rejects a malformed uuid with an error; a bad route param should
// simply be "not found".
export function isUuid(value: string) {
  return UUID_RE.test(value);
}

export function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || "N";
}

// One select shape for every collaboration read: list, detail, thread.
export function collaborationSelect() {
  return getDb()
    .select({
      collab: collaborations,
      campaignName: campaigns.name,
      brandId: brands.id,
      brandCompany: brands.company,
      brandWebsite: brands.website,
      creatorHandle: creators.handle,
      creatorAvatarUrl: creators.avatarUrl,
      creatorFirstName: users.firstName,
      creatorLastName: users.lastName,
      trackingCode: trackingLinks.code,
      trackingDestination: trackingLinks.destination,
      clicks: sql<number>`(select count(*) from ${clicks} where ${clicks.trackingLinkId} = ${trackingLinks.id})::int`,
    })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .leftJoin(trackingLinks, eq(trackingLinks.collaborationId, collaborations.id));
}

export type CollaborationRow = Awaited<ReturnType<ReturnType<typeof collaborationSelect>["execute"]>>[number];

// `logos`: brand logos by brand id, for the creator's side (a brand sees creators).
export function toCollaborationDto(row: CollaborationRow, role: ViewerRole, logos?: Map<string, string>): CollaborationDto {
  const c = row.collab;
  return {
    id: c.id,
    status: c.status,
    origin: c.origin,
    campaignId: c.campaignId,
    campaignName: row.campaignName,
    brandId: row.brandId,
    brandCompany: row.brandCompany,
    brandInitial: initialOf(row.brandCompany),
    brandLogoUrl: logos?.get(row.brandId) ?? null,
    brandWebsite: row.brandWebsite,
    creatorId: c.creatorId,
    creatorName: `${row.creatorFirstName} ${row.creatorLastName}`.trim(),
    creatorHandle: row.creatorHandle,
    creatorAvatarUrl: row.creatorAvatarUrl,
    feeCents: c.feeCents,
    listPriceCents: c.listPriceCents,
    discountPercent: c.discountPercent,
    approveBeforePublish: c.approveBeforePublish,
    acceptBy: iso(c.acceptBy),
    offerNote: c.offerNote,
    dueDate: iso(c.dueDate),
    revisionRound: c.revisionRound,
    maxRevisionRounds: MAX_REVISION_ROUNDS,
    draftText: c.draftText,
    reviewNote: c.reviewNote,
    postUrl: c.postUrl,
    scheduledAt: iso(c.scheduledAt),
    publishedAt: iso(c.publishedAt),
    paidAt: iso(c.paidAt),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    trackingCode: row.trackingCode,
    trackingDestination: row.trackingDestination,
    clicks: PERFORMANCE_STATUSES.includes(c.status) ? row.clicks : null,
    allowedEvents: allowedEvents(c.status, role),
  };
}

type EventRow = typeof collaborationEvents.$inferSelect;

export function toEventDto(row: EventRow): CollaborationEventDto {
  return {
    id: row.id,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    event: row.event,
    actor: row.actor,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

type CampaignRow = typeof campaigns.$inferSelect;
type BrandRow = typeof brands.$inferSelect;

export function toBriefDto(campaign: CampaignRow, brand: BrandRow, trackedUrl: string | null): BriefDto {
  const brief = campaign.brief;
  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    campaignDescription: campaign.description,
    brandCompany: brand.company,
    brandInitial: initialOf(brand.company),
    brandWebsite: brand.website,
    valueProp: brand.valueProp,
    icpTitles: brand.icps.map((i) => i.title),
    whatToTell: brief.whatToTell,
    targetIndustries: brief.targetIndustries.length > 0 ? brief.targetIndustries : brand.targetIndustries,
    targetGeos: brief.targetGeos.length > 0 ? brief.targetGeos : brand.targetRegions,
    tone: brief.tone,
    do: brief.do,
    avoid: brief.avoid,
    links: brief.links,
    angles: brief.angles,
    angleCount: brief.angles.length,
    trackedUrl,
    postDeadline: iso(campaign.postDeadline),
  };
}
