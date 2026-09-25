import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { OpportunitiesView } from "@/features/collaborations/components/opportunities/OpportunitiesView";
import { listOpportunities } from "@/features/collaborations/server/opportunities-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Opportunities · ${BRAND.wordmark}` };

export default async function CreatorOpportunitiesPage() {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login?next=/creator/opportunities");
  const t = await getTranslations("creator.opportunities");
  let opportunities;
  try {
    opportunities = await listOpportunities(viewer.creator.id);
  } catch (error) {
    console.error("[opportunities] list failed", { creatorId: viewer.creator.id, error });
    return (
      <>
        <PageHeader title={t("title")} description={t("description")} />
        <ErrorState body={t("error.body")} retryHref="/creator/opportunities" />
      </>
    );
  }
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <OpportunitiesView opportunities={opportunities} csrfToken={viewer.csrfToken} />
    </>
  );
}
