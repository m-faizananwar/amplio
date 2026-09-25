import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { BRAND } from "@/config/brand";
import { getViewer } from "@/features/auth/server/session";
import { BrandCollaborationsList, type BrandListFilter } from "@/features/collaborations/components/brand-list/BrandCollaborationsList";
import { listBrandCampaignOptions, listBrandCollaborations } from "@/features/collaborations/server/queries";

export const metadata: Metadata = { title: `Collaborations · ${BRAND.wordmark}` };

const FILTERS: readonly BrandListFilter[] = ["needs_you", "waiting", "done", "all"];

export default async function BrandCollaborationsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.brand) redirect("/login?next=/brand/collaborations");
  const [{ filter }, t] = await Promise.all([searchParams, getTranslations("brand.collaborations")]);
  const initial = (FILTERS as readonly string[]).includes(filter ?? "") ? (filter as BrandListFilter) : "needs_you";
  const header = <PageHeader title={t("title")} description={t("description")} />;
  const data = await Promise.all([listBrandCollaborations(viewer.brand.id), listBrandCampaignOptions(viewer.brand.id)]).catch((error) => {
    console.error("[collaborations] brand list failed", { brandId: viewer.brand?.id, error });
    return null;
  });
  if (!data) return <>{header}<ErrorState body={t("error")} retryHref="/brand/collaborations" /></>;
  const [rows, campaigns] = data;
  return <>{header}<BrandCollaborationsList rows={rows} campaigns={campaigns} initialFilter={initial} /></>;
}
