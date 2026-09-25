import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { MessagesLayout } from "@/features/collaborations/components/messages/MessagesLayout";
import { ThreadView } from "@/features/collaborations/components/messages/ThreadView";
import { getThread, listThreads, threadScopeFor } from "@/features/collaborations/server/messages-queries";
import { listBrandCampaignOptions } from "@/features/collaborations/server/queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Messages · ${BRAND.wordmark}` };

type Props = { params: Promise<{ collaborationId: string }> };

export default async function BrandThreadPage({ params }: Props) {
  const { collaborationId } = await params;
  const viewer = await getViewer();
  const scope = viewer && threadScopeFor(viewer);
  if (!viewer || !scope) redirect(`/login?next=/brand/messages/${collaborationId}`);

  const t = await getTranslations("collaboration.messages");
  const header = <PageHeader title={t("title")} description={t("description")} />;
  let data;
  try {
    data = await Promise.all([
      listThreads(scope),
      listBrandCampaignOptions(scope.ownerId),
      getThread(scope, collaborationId),
    ]);
  } catch (error) {
    console.error("[messages] brand thread failed", { collaborationId, brandId: scope.ownerId, error });
    return <>{header}<ErrorState title={t("error.title")} body={t("error.body")} retryHref={`/brand/messages/${collaborationId}`} /></>;
  }
  const [threads, campaigns, detail] = data;
  if (!detail) notFound();

  return (
    <>
    {header}
    <MessagesLayout threads={threads} role="brand" activeId={collaborationId} campaigns={campaigns}>
      <ThreadView detail={detail} role="brand" csrfToken={viewer.csrfToken} senderName={viewer.brand?.company ?? "You"} senderAvatarUrl={null} />
    </MessagesLayout>
    </>
  );
}
