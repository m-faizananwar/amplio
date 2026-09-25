import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { getViewer } from "@/features/auth/server/session";
import { CollaborationDetail } from "@/features/collaborations/components/detail/CollaborationDetail";
import { getCollaborationDetail } from "@/features/collaborations/server/queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Collaboration · ${BRAND.wordmark}` };

type Props = { params: Promise<{ id: string }> };

export default async function CreatorCollaborationPage({ params }: Props) {
  const { id } = await params;
  const viewer = await getViewer();
  if (!viewer?.creator) redirect(`/login?next=/creator/collaborations/${id}`);

  let detail;
  try {
    detail = await getCollaborationDetail({ id, role: "creator", ownerId: viewer.creator.id });
  } catch (error) {
    console.error("[collaborations] creator detail failed", { id, creatorId: viewer.creator.id, error });
    return <ErrorState title={(await getTranslations("collaboration.detail"))("error.title")} body={(await getTranslations("collaboration.detail"))("error.body")} retryHref={`/creator/collaborations/${id}`} />;
  }
  if (!detail) notFound();

  return <CollaborationDetail detail={detail} role="creator" csrfToken={viewer.csrfToken} />;
}
