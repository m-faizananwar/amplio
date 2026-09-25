import "server-only";
import { and, desc, eq, gte, inArray, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, collaborationEvents, collaborations, creators, messages, users } from "@/db/schema";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

export type Notification = { id: string; title: string; body: string; href: string; at: string };

const DAY_MS = 86_400_000;
const RECENT_DAYS = 14;
// naano's bell shows a short list; the badge counts the same rows.
const NOTIFICATION_CAP = 8;

type Copy = (counterpart: string, campaign: string) => { title: string; body: string };

// What a brand hears about: the creator's moves on its collaborations.
const BRAND_STATUSES = ["applied", "accepted", "declined", "draft_submitted", "scheduled", "live"] as const satisfies CollaborationStatus[];
const BRAND_EVENT_COPY: Record<(typeof BRAND_STATUSES)[number], Copy> = {
  applied: (c, k) => ({ title: `${c} applied`, body: `${k} · accept to create the booking` }),
  accepted: (c, k) => ({ title: `${c} accepted your invitation`, body: `${k} · the thread is open` }),
  declined: (c, k) => ({ title: `${c} declined your invitation`, body: `${k} · the held fee is back in your wallet` }),
  draft_submitted: (c, k) => ({ title: `Draft ready from ${c}`, body: `${k} · review before it is published` }),
  scheduled: (c, k) => ({ title: `${c} scheduled the post`, body: `${k} · goes live on the planned date` }),
  live: (c, k) => ({ title: `${c}'s post is live`, body: `${k} · pay to release the creator's earnings` }),
};

// What a creator hears about: the brand's (or the system's) moves.
const CREATOR_STATUSES = ["invited", "accepted", "declined", "changes_requested", "approved", "paid"] as const satisfies CollaborationStatus[];
const CREATOR_EVENT_COPY: Record<(typeof CREATOR_STATUSES)[number], Copy> = {
  invited: (b, k) => ({ title: `${b} sent a collaboration request`, body: `${k} · accept or decline within 48 hours` }),
  accepted: (b, k) => ({ title: `${b} accepted your application`, body: `${k} · the booking is created` }),
  declined: (b, k) => ({ title: `${b} declined your application`, body: `${k} · keep an eye on new opportunities` }),
  changes_requested: (b, k) => ({ title: `${b} requested changes`, body: `${k} · update your draft` }),
  approved: (b, k) => ({ title: `${b} approved your draft`, body: `${k} · schedule the post` }),
  paid: (b, k) => ({ title: `${b} paid you`, body: `${k} · earnings released` }),
};

function since() {
  return new Date(Date.now() - RECENT_DAYS * DAY_MS);
}

function newestFirst(items: Notification[]) {
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, NOTIFICATION_CAP);
}

// A "resubmitted" draft is the same transition as the first submission; the
// round number tells them apart in the title.
function resubmitTitle(copy: { title: string; body: string }, fromStatus: string | null) {
  return fromStatus === "changes_requested" ? { ...copy, title: copy.title.replace("Draft ready", "Updated draft") } : copy;
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
    .select({ id: messages.id, createdAt: messages.createdAt, collaborationId: messages.collaborationId, firstName: users.firstName, lastName: users.lastName })
    .from(messages)
    .innerJoin(collaborations, eq(collaborations.id, messages.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(users, eq(users.id, messages.senderUserId))
    .where(and(eq(campaigns.brandId, brandId), ne(messages.senderUserId, userId), gte(messages.createdAt, since())))
    .orderBy(desc(messages.createdAt))
    .limit(NOTIFICATION_CAP);
  return newestFirst([
    ...events.map((e) => {
      const name = `${e.firstName} ${e.lastName}`;
      const copy = resubmitTitle(BRAND_EVENT_COPY[e.toStatus as (typeof BRAND_STATUSES)[number]](name, e.campaign), e.fromStatus);
      return { id: e.id, ...copy, href: `/brand/collaborations/${e.collaborationId}`, at: e.createdAt.toISOString() };
    }),
    ...msgs.map((m) => ({ id: m.id, title: `New message from ${m.firstName} ${m.lastName}`, body: "Open the thread to reply", href: `/brand/messages/${m.collaborationId}`, at: m.createdAt.toISOString() })),
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
    .select({ id: messages.id, createdAt: messages.createdAt, collaborationId: messages.collaborationId, brand: brands.company })
    .from(messages)
    .innerJoin(collaborations, eq(collaborations.id, messages.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .where(and(eq(collaborations.creatorId, creatorId), ne(messages.senderUserId, userId), gte(messages.createdAt, since())))
    .orderBy(desc(messages.createdAt))
    .limit(NOTIFICATION_CAP);
  return newestFirst([
    ...events.map((e) => {
      const copy = CREATOR_EVENT_COPY[e.toStatus as (typeof CREATOR_STATUSES)[number]](e.brand, e.campaign);
      return { id: e.id, ...copy, href: `/creator/collaborations/${e.collaborationId}`, at: e.createdAt.toISOString() };
    }),
    ...msgs.map((m) => ({ id: m.id, title: `New message from ${m.brand}`, body: "Open the thread to reply", href: `/creator/messages/${m.collaborationId}`, at: m.createdAt.toISOString() })),
  ]);
}

// The bell. Part of the shell, so it is cached with the viewer: any mutation
// that touches either side's shell drops it.
export function getBrandNotifications(brandId: string, userId: string) {
  return cachedRead(loadBrandNotifications, ["brand-notifications"], { tags: [tag.viewer(userId), tag.brandCollaborations(brandId)] })(brandId, userId);
}

export function getCreatorNotifications(creatorId: string, userId: string) {
  return cachedRead(loadCreatorNotifications, ["creator-notifications"], { tags: [tag.viewer(userId), tag.creatorCollaborations(creatorId)] })(creatorId, userId);
}
