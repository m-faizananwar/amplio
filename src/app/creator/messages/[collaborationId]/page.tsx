import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { MessagesLayout } from "@/features/collaborations/components/messages/MessagesLayout";
import { ThreadView } from "@/features/collaborations/components/messages/ThreadView";
import { getThread, listThreads, threadScopeFor } from "@/features/collaborations/server/messages-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Messages · ${BRAND.wordmark}` };

type Props = { params: Promise<{ collaborationId: string }> };

export default async function CreatorThreadPage({ params }: Props) {
  const { collaborationId } = await params;
  const viewer = await getViewer();
  const scope = viewer && threadScopeFor(viewer);
  if (!viewer || !scope) redirect(`/login?next=/creator/messages/${collaborationId}`);

  let data;
  try {
    data = await Promise.all([listThreads(scope), getThread(scope, collaborationId)]);
  } catch (error) {
    console.error("[messages] creator thread failed", { collaborationId, creatorId: scope.ownerId, error });
    return <ErrorState title={(await getTranslations("collaboration.messages"))("error.title")} body={(await getTranslations("collaboration.messages"))("error.body")} retryHref={`/creator/messages/${collaborationId}`} />;
  }
  const [threads, detail] = data;
  if (!detail) notFound();

  const t = await getTranslations("collaboration.messages");
  return (
    <>
    <PageHeader title={t("title")} description={t("description")} />
    <MessagesLayout threads={threads} role="creator" activeId={collaborationId}>
      <ThreadView
          detail={detail}
          role="creator"
          csrfToken={viewer.csrfToken}
          senderName={`${viewer.firstName} ${viewer.lastName}`.trim()}
          senderAvatarUrl={viewer.creator?.avatarUrl ?? null}
        />
    </MessagesLayout>
    </>
  );
}
