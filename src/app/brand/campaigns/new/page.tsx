import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page/PageHeader";
import { BRAND } from "@/config/brand";
import { AiComposer } from "@/features/campaigns/components/create/AiComposer";
import { requireBrand } from "@/features/campaigns/server/require-brand";

export const metadata: Metadata = { title: `New campaign · ${BRAND.wordmark}` };

// One way in: three questions, then an editable brief. (The "start from a
// link" path is cut — the link was never read.)
export default async function NewCampaignPage() {
  await requireBrand("/brand/campaigns/new");
  const t = await getTranslations("brand.campaigns.create");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="max-w-2xl"><AiComposer /><p className="mt-3 text-caption text-ink-muted">{t("note")}</p></div>
    </>
  );
}
