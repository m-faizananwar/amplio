import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { isDemoEmail } from "@/features/auth/constants";
import { getViewer } from "@/features/auth/server/session";
import { BrandSettingsView } from "@/features/workspace/components/settings/brand/BrandSettingsView";
import { getBrandSettings } from "@/features/workspace/server/settings-queries";

import { BRAND } from "@/config/brand";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings.brand");
  return { title: `${t("title")} · ${BRAND.wordmark}` };
}

export default async function BrandSettingsPage() {
  const viewer = await getViewer();
  if (!viewer?.brand) redirect("/login");
  const t = await getTranslations("settings.brand");
  let settings;
  try {
    settings = await getBrandSettings(viewer.brand.id);
  } catch (error) {
    console.error("[settings] brand settings failed", { brandId: viewer.brand.id, error });
    return <ErrorState body={t("error.body")} retryHref="/brand/settings" />;
  }
  if (!settings) redirect("/login");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <BrandSettingsView settings={settings} email={viewer.email} isDemo={isDemoEmail(viewer.email)} />
    </>
  );
}
