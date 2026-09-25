import "server-only";
import { and, desc, eq, gte, inArray, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, collaborationEvents, collaborations, creators, messages, users } from "@/db/schema";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

// A bell row as facts; the shell words it in the reader's language
// (shell.notifications.*). `status` is the collaboration's new state for a
// status event, null for a message.
export type Notification = {
  id: string;
  kind: "status" | "message";
  status: CollaborationStatus | null;
  /** A draft sent again after changes were requested. */
  resubmitted: boolean;
  counterpart: string;
  campaign: string;
  href: string;
  at: string;
};

const DAY_MS = 86_400_000;
const RECENT_DAYS = 14;
// The bell shows a short list; the badge counts the same rows.
const NOTIFICATION_CAP = 8;

// What a brand hears about: the creator's moves on its collaborations.
const BRAND_STATUSES = ["applied", "accepted", "declined", "draft_submitted", "scheduled", "live"] as const satisfies CollaborationStatus[];
// What a creator hears about: the brand's (or the system's) moves.
const CREATOR_STATUSES = ["invited", "accepted", "declined", "changes_requested", "approved", "paid"] as const satisfies CollaborationStatus[];

function since() {
  return new Date(Date.now() - RECENT_DAYS * DAY_MS);
}

function newestFirst(items: Notification[]) {
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, NOTIFICATION_CAP);
}

async function loadBrandNotifications(brandId: string, userId: string): Promise<Notification[]> {
  const db = getDb();
  const events = await db
    .select({
      id: collaborationEvents.id, collaborationId: collaborationEvents.collaborationId, toStatus: collaborationEvents.toStatus,
      fromStatus: collaborationEvents.fromStatus, createdAt: collaborationEvents.createdAt, campaign: campaigns.name,
      firstName: users.firstName, lastName: users.lastName,
    })
    .from(collaborationEvents)
    .innerJoin(collaborations, eq(collaborations.id, collaborationEvents.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .where(and(eq(campaigns.brandId, brandId), eq(collaborationEvents.actor, "creator"), gte(collaborationEvents.createdAt, since()), inArray(collaborationEvents.toStatus, BRAND_STATUSES)))
    .orderBy(desc(collaborationEvents.createdAt))
    .limit(NOTIFICATION_CAP);
  const msgs = await db
    .select({ id: messages.id, createdAt: messages.createdAt, collaborationId: messages.collaborationId, firstName: users.firstName, lastName: users.lastName, campaign: campaigns.name })
    .from(messages)
    .innerJoin(collaborations, eq(collaborations.id, messages.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(users, eq(users.id, messages.senderUserId))
    .where(and(eq(campaigns.brandId, brandId), ne(messages.senderUserId, userId), gte(messages.createdAt, since())))
    .orderBy(desc(messages.createdAt))
    .limit(NOTIFICATION_CAP);
  return newestFirst([
    ...events.map((e): Notification => ({
      id: e.id, kind: "status", status: e.toStatus, resubmitted: e.fromStatus === "changes_requested", counterpart: `${e.firstName} ${e.lastName}`.trim(),
      campaign: e.campaign, href: `/brand/collaborations/${e.collaborationId}`, at: e.createdAt.toISOString(),
    })),
    ...msgs.map((m): Notification => ({
      id: m.id, kind: "message", status: null, resubmitted: false, counterpart: `${m.firstName} ${m.lastName}`.trim(),
      campaign: m.campaign, href: `/brand/messages/${m.collaborationId}`, at: m.createdAt.toISOString(),
    })),
  ]);
}

async function loadCreatorNotifications(creatorId: string, userId: string): Promise<Notification[]> {
  const db = getDb();
  const events = await db
    .select({
      id: collaborationEvents.id, collaborationId: collaborationEvents.collaborationId, toStatus: collaborationEvents.toStatus,
      createdAt: collaborationEvents.createdAt, campaign: campaigns.name, brand: brands.company,
    })
    .from(collaborationEvents)
    .innerJoin(collaborations, eq(collaborations.id, collaborationEvents.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .where(and(eq(collaborations.creatorId, creatorId), ne(collaborationEvents.actor, "creator"), gte(collaborationEvents.createdAt, since()), inArray(collaborationEvents.toStatus, CREATOR_STATUSES)))
    .orderBy(desc(collaborationEvents.createdAt))
    .limit(NOTIFICATION_CAP);
  const msgs = await db
    .select({ id: messages.id, createdAt: messages.createdAt, collaborationId: messages.collaborationId, brand: brands.company, campaign: campaigns.name })
    .from(messages)
    .innerJoin(collaborations, eq(collaborations.id, messages.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .where(and(eq(collaborations.creatorId, creatorId), ne(messages.senderUserId, userId), gte(messages.createdAt, since())))
    .orderBy(desc(messages.createdAt))
    .limit(NOTIFICATION_CAP);
  return newestFirst([
    ...events.map((e): Notification => ({
      id: e.id, kind: "status", status: e.toStatus, resubmitted: false, counterpart: e.brand,
      campaign: e.campaign, href: `/creator/collaborations/${e.collaborationId}`, at: e.createdAt.toISOString(),
    })),
    ...msgs.map((m): Notification => ({
      id: m.id, kind: "message", status: null, resubmitted: false, counterpart: m.brand,
      campaign: m.campaign, href: `/creator/messages/${m.collaborationId}`, at: m.createdAt.toISOString(),
    })),
  ]);
}

// The bell. Part of the shell, so it is cached with the viewer: any mutation
// that touches either side's shell drops it.
export function getBrandNotifications(brandId: string, userId: string) {
  return cachedRead(loadBrandNotifications, ["brand-notifications-v2"], { tags: [tag.viewer(userId), tag.brandCollaborations(brandId)] })(brandId, userId);
}

export function getCreatorNotifications(creatorId: string, userId: string) {
  return cachedRead(loadCreatorNotifications, ["creator-notifications-v2"], { tags: [tag.viewer(userId), tag.creatorCollaborations(creatorId)] })(creatorId, userId);
}
