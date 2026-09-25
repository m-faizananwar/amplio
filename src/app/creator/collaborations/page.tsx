import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { CreatorCollaborationsList, type ListFilter } from "@/features/collaborations/components/creator-list/CreatorCollaborationsList";
import { listCreatorCollaborations } from "@/features/collaborations/server/queries";

import { BRAND } from "@/config/brand";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("creator.collaborations");
  return { title: `${t("title")} · ${BRAND.wordmark}` };
}

const FILTERS: readonly ListFilter[] = ["needs_you", "waiting", "live", "done", "all"];

export default async function CreatorCollaborationsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login?next=/creator/collaborations");
  const [{ filter }, t] = await Promise.all([searchParams, getTranslations("creator.collaborations")]);
  const initial = (FILTERS as readonly string[]).includes(filter ?? "") ? (filter as ListFilter) : "needs_you";
  let rows;
  try {
    rows = await listCreatorCollaborations(viewer.creator.id);
  } catch (error) {
    console.error("[collaborations] creator list failed", { creatorId: viewer.creator.id, error });
    return (
      <>
        <PageHeader title={t("title")} description={t("description")} />
        <ErrorState body={t("error.body")} retryHref="/creator/collaborations" />
      </>
    );
  }
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <CreatorCollaborationsList rows={rows} initialFilter={initial} />
    </>
  );
}
