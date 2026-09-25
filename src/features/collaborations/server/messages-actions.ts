"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { updateTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { messages } from "@/db/schema";
import { type ActionResult, type MessageDto, type SendMessageInput, sendMessageSchema } from "../schemas";
import { collaborationScope } from "./cache-scope";
import { NOT_YOURS, authorize, friendlyError, ownedCollaborationId } from "./ownership";

// Either party may write once the thread exists; the ownership check is the
// same one the collaboration actions use, so a stranger gets "not yours".
export async function sendMessage(input: SendMessageInput): Promise<ActionResult<MessageDto>> {
  const auth = await authorize(sendMessageSchema, input, "any");
  if (!auth.ok) return auth;

  const owned = await ownedCollaborationId(auth.viewer, auth.data.collaborationId);
  if (!owned) return { ok: false, error: NOT_YOURS };

  try {
    const [row] = await getDb()
      .insert(messages)
      .values({ collaborationId: owned, senderUserId: auth.viewer.userId, body: auth.data.body })
      .returning();
    updateTags(tagsForMutation("message", await collaborationScope(owned)));
    for (const root of ["/creator", "/brand"]) {
      revalidatePath(`${root}/messages`);
      revalidatePath(`${root}/messages/${owned}`);
    }
    const senderName = auth.viewer.brand?.company ?? `${auth.viewer.firstName} ${auth.viewer.lastName}`.trim();
    return {
      ok: true,
      data: {
        id: row.id,
        body: row.body,
        senderName,
        senderKind: auth.viewer.brand ? "brand" : "person",
        senderAvatarUrl: auth.viewer.creator?.avatarUrl ?? null,
        mine: true,
        createdAt: row.createdAt.toISOString(),
      },
    };
  } catch (error) {
    return friendlyError(error, { collaborationId: owned, event: "message" });
  }
}
