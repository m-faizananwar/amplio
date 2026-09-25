import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { MessagesLayout } from "@/features/collaborations/components/messages/MessagesLayout";
import { ThreadPlaceholder } from "@/features/collaborations/components/messages/ThreadPlaceholder";
import { listThreads, threadScopeFor } from "@/features/collaborations/server/messages-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Messages · ${BRAND.wordmark}` };

export default async function CreatorMessagesPage() {
  const viewer = await getViewer();
  const scope = viewer && threadScopeFor(viewer);
  if (!scope) redirect("/login?next=/creator/messages");

  let threads;
  try {
    threads = await listThreads(scope);
  } catch (error) {
    console.error("[messages] creator list failed", { creatorId: scope.ownerId, error });
    return <ErrorState body="We could not load your messages. Try again in a moment." retryHref="/creator/messages" />;
  }

  const t = await getTranslations("collaboration.messages");
  return (
    <>
    <PageHeader title={t("title")} description={t("description")} />
    <MessagesLayout threads={threads} role="creator" activeId={null}>
      <ThreadPlaceholder hasThreads={threads.length > 0} />
    </MessagesLayout>
    </>
  );
}
