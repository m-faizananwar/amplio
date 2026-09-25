import "server-only";
import { avatarFor } from "@/lib/avatar";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { campaigns, collaborations, creators, messages, users } from "@/db/schema";
import { THREAD_STATUSES } from "@/lib/collaboration-labels";
import type { MessageDto, ThreadDetailDto, ThreadDto, ViewerRole } from "../schemas";
import { type CollaborationRow, collaborationSelect, initialOf, isUuid } from "./dto";
import { MAX_THREAD_MESSAGES, MESSAGE_PREVIEW_CHARS } from "../ui-constants";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

export type ThreadScope = { role: ViewerRole; ownerId: string; userId: string };

function ownerFilter(scope: ThreadScope) {
  return scope.role === "creator" ? eq(collaborations.creatorId, scope.ownerId) : eq(campaigns.brandId, scope.ownerId);
}

function preview(body: string | null) {
  if (!body) return null;
  const oneLine = body.replace(/\s+/g, " ").trim();
  return oneLine.length > MESSAGE_PREVIEW_CHARS ? `${oneLine.slice(0, MESSAGE_PREVIEW_CHARS)}…` : oneLine;
}

function toThreadDto(row: CollaborationRow, role: ViewerRole, last: { body: string | null; at: Date | null }): ThreadDto {
  const creatorName = `${row.creatorFirstName} ${row.creatorLastName}`.trim();
  const counterpartName = role === "brand" ? creatorName : row.brandCompany;
  return {
    collaborationId: row.collab.id,
    campaignId: row.collab.campaignId,
    campaignName: row.campaignName,
    status: row.collab.status,
    counterpartName,
    counterpartKind: role === "brand" ? "person" : "brand",
    counterpartAvatarUrl: role === "brand" ? row.creatorAvatarUrl : null,
    counterpartInitial: initialOf(counterpartName),
    lastMessagePreview: preview(last.body),
    lastMessageAt: last.at ? last.at.toISOString() : null,
  };
}

async function lastMessages(collaborationIds: string[]) {
  if (collaborationIds.length === 0) return new Map<string, { body: string | null; at: Date | null }>();
  const rows = await getDb()
    .selectDistinctOn([messages.collaborationId], {
      collaborationId: messages.collaborationId,
      body: messages.body,
      at: messages.createdAt,
    })
    .from(messages)
    .where(inArray(messages.collaborationId, collaborationIds))
    .orderBy(messages.collaborationId, desc(messages.createdAt));
  return new Map(rows.map((r) => [r.collaborationId, { body: r.body, at: r.at }]));
}

// One thread per accepted-or-later collaboration on the viewer's side,
// newest activity first.
async function loadThreads(scope: ThreadScope): Promise<ThreadDto[]> {
  const rows = await collaborationSelect().where(
    and(ownerFilter(scope), inArray(collaborations.status, [...THREAD_STATUSES])),
  );
  const last = await lastMessages(rows.map((r) => r.collab.id));
  return rows
    .map((r) => toThreadDto(r, scope.role, last.get(r.collab.id) ?? { body: null, at: null }))
    .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

// The viewer must be a party (owner filter) for the thread to exist at all.
async function loadThread(scope: ThreadScope, collaborationId: string): Promise<ThreadDetailDto | null> {
  if (!isUuid(collaborationId)) return null;
  const [row] = await collaborationSelect().where(and(eq(collaborations.id, collaborationId), ownerFilter(scope)));
  if (!row || !THREAD_STATUSES.includes(row.collab.status)) return null;

  const list = await getDb()
    .select({
      id: messages.id,
      body: messages.body,
      createdAt: messages.createdAt,
      senderUserId: messages.senderUserId,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      avatarUrl: sql<string | null>`(select ${creators.avatarUrl} from ${creators} where ${creators.userId} = ${users.id})`,
    })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.senderUserId))
    .where(eq(messages.collaborationId, collaborationId))
    .orderBy(asc(messages.createdAt))
    .limit(MAX_THREAD_MESSAGES);

  const dtos: MessageDto[] = list.map((m) => ({
    id: m.id,
    body: m.body,
    senderName: m.role === "brand" ? row.brandCompany : `${m.firstName} ${m.lastName}`.trim(),
    senderKind: m.role === "brand" ? "brand" : "person",
    senderAvatarUrl: m.role === "brand" ? null : (m.avatarUrl ?? avatarFor(`${m.firstName} ${m.lastName}`)),
    mine: m.senderUserId === scope.userId,
    createdAt: m.createdAt.toISOString(),
  }));
  const lastMessage = list[list.length - 1];
  return {
    thread: toThreadDto(row, scope.role, { body: lastMessage?.body ?? null, at: lastMessage?.createdAt ?? null }),
    messages: dtos,
  };
}

// The viewer's side of every thread query; null when the profile is missing.
export function threadScopeFor(viewer: { role: ViewerRole; userId: string; brand: { id: string } | null; creator: { id: string } | null }): ThreadScope | null {
  const ownerId = viewer.role === "brand" ? viewer.brand?.id : viewer.creator?.id;
  return ownerId ? { role: viewer.role, ownerId, userId: viewer.userId } : null;
}

// Threads and one thread's messages, tagged by the side reading them.
export function listThreads(scope: ThreadScope) {
  return cachedRead(loadThreads, ["threads"], { tags: [scope.role === "creator" ? tag.creatorMessages(scope.ownerId) : tag.brandMessages(scope.ownerId)] })(scope);
}

export function getThread(scope: ThreadScope, collaborationId: string) {
  return cachedRead(loadThread, ["thread"], { tags: [scope.role === "creator" ? tag.creatorMessages(scope.ownerId) : tag.brandMessages(scope.ownerId)] })(scope, collaborationId);
}
