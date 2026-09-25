import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, collaborationEvents, collaborations } from "@/db/schema";
import type { CampaignOption, CollaborationDetailDto, CollaborationDto, ViewerRole } from "../schemas";
import { trackedUrlFor } from "./app-url";
import { collaborationSelect, isUuid, toBriefDto, toCollaborationDto, toEventDto } from "./dto";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

async function loadCreatorCollaborations(creatorId: string): Promise<CollaborationDto[]> {
  const rows = await collaborationSelect()
    .where(eq(collaborations.creatorId, creatorId))
    .orderBy(desc(collaborations.updatedAt));
  return rows.map((r) => toCollaborationDto(r, "creator"));
}

async function loadBrandCollaborations(brandId: string): Promise<CollaborationDto[]> {
  const rows = await collaborationSelect()
    .where(eq(campaigns.brandId, brandId))
    .orderBy(desc(collaborations.updatedAt));
  return rows.map((r) => toCollaborationDto(r, "brand"));
}

async function loadBrandCampaignOptions(brandId: string): Promise<CampaignOption[]> {
  return getDb()
    .select({ id: campaigns.id, name: campaigns.name })
    .from(campaigns)
    .where(eq(campaigns.brandId, brandId))
    .orderBy(asc(campaigns.createdAt));
}

type DetailScope = { id: string; role: ViewerRole; ownerId: string };

// Ownership is part of the query: a creator only sees their own rows, a brand
// only rows on its campaigns. Anything else is "not found", never "forbidden".
async function loadCollaborationDetail(scope: DetailScope): Promise<CollaborationDetailDto | null> {
  if (!isUuid(scope.id)) return null;
  const owner = scope.role === "creator" ? eq(collaborations.creatorId, scope.ownerId) : eq(campaigns.brandId, scope.ownerId);
  const [row] = await collaborationSelect().where(and(eq(collaborations.id, scope.id), owner));
  if (!row) return null;

  const db = getDb();
  const [events, [campaignRow]] = await Promise.all([
    db
      .select()
      .from(collaborationEvents)
      .where(eq(collaborationEvents.collaborationId, row.collab.id))
      .orderBy(asc(collaborationEvents.createdAt)),
    db
      .select({ campaign: campaigns, brand: brands })
      .from(campaigns)
      .innerJoin(brands, eq(brands.id, campaigns.brandId))
      .where(eq(campaigns.id, row.collab.campaignId)),
  ]);
  if (!campaignRow) return null;

  const trackedUrl = await trackedUrlFor(row.trackingCode);
  return {
    collaboration: toCollaborationDto(row, scope.role),
    events: events.map(toEventDto),
    brief: toBriefDto(campaignRow.campaign, campaignRow.brand, trackedUrl),
    trackedUrl,
  };
}

// Collaboration lists and one detail row, tagged by the side that owns them.
export function listCreatorCollaborations(creatorId: string) {
  return cachedRead(loadCreatorCollaborations, ["creator-collaborations"], { tags: [tag.creatorCollaborations(creatorId)] })(creatorId);
}

export function listBrandCollaborations(brandId: string) {
  return cachedRead(loadBrandCollaborations, ["brand-collaborations"], { tags: [tag.brandCollaborations(brandId)] })(brandId);
}

export function listBrandCampaignOptions(brandId: string) {
  return cachedRead(loadBrandCampaignOptions, ["brand-campaign-options"], { tags: [tag.brandCampaigns(brandId)] })(brandId);
}

export function getCollaborationDetail(scope: DetailScope) {
  return cachedRead(loadCollaborationDetail, ["collaboration-detail"], { tags: [scope.role === "creator" ? tag.creatorCollaborations(scope.ownerId) : tag.brandCollaborations(scope.ownerId)] })(scope);
}
