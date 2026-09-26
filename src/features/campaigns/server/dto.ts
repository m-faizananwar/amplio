import "server-only";
import type { campaigns, collaborations, creators } from "@/db/schema";
import { storedBriefSchema, type Brief, type CampaignDto, type CollaborationRowDto } from "../schemas";

type CampaignRow = typeof campaigns.$inferSelect;
type CollabRow = typeof collaborations.$inferSelect;
type CreatorRow = typeof creators.$inferSelect;

// Older rows may predate a field; parse so the view always gets the full shape.
function briefOf(row: CampaignRow): Brief {
  const parsed = storedBriefSchema.safeParse(row.brief);
  return parsed.success
    ? parsed.data
    : { whatToTell: "", targetIndustries: [], targetGeos: [], tone: "", do: [], avoid: [], links: [], angles: [] };
}

export function toCampaignDto(row: CampaignRow): CampaignDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    source: row.source,
    sourcePrompt: row.sourcePrompt,
    sourceUrl: row.sourceUrl,
    openToApplications: row.openToApplications,
    postDeadline: row.postDeadline ? row.postDeadline.toISOString() : null,
    defaultFeeCents: row.defaultFeeCents,
    brief: briefOf(row),
    createdAt: row.createdAt.toISOString(),
  };
}

export type CollabJoin = {
  collab: CollabRow;
  campaignName: string;
  creator: Pick<CreatorRow, "id" | "avatarUrl">;
  firstName: string;
  lastName: string;
};

export function toCollaborationRowDto(join: CollabJoin): CollaborationRowDto {
  return {
    id: join.collab.id,
    creatorId: join.creator.id,
    creatorName: `${join.firstName} ${join.lastName}`.trim(),
    creatorAvatarUrl: join.creator.avatarUrl,
    campaignId: join.collab.campaignId,
    campaignName: join.campaignName,
    status: join.collab.status,
    origin: join.collab.origin,
    feeCents: join.collab.feeCents,
    dueDate: join.collab.dueDate ? join.collab.dueDate.toISOString() : null,
    updatedAt: join.collab.updatedAt.toISOString(),
  };
}
