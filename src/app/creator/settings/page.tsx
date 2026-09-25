import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { isDemoEmail } from "@/features/auth/constants";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { CreatorSettingsView } from "@/features/workspace/components/settings/creator/CreatorSettingsView";
import { getCreatorSettings } from "@/features/workspace/server/settings-queries";
import { recommendPrice } from "@/lib/recommend-price";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Settings · ${BRAND.wordmark}` };

export default async function CreatorSettingsPage() {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  let settings;
  try {
    settings = await getCreatorSettings(viewer.creator.id);
  } catch (error) {
    console.error("[settings] creator settings failed", { creatorId: viewer.creator.id, error });
    return <ErrorState title={(await getTranslations("settings.creator"))("error.title")} body={(await getTranslations("settings.creator"))("error.body")} retryHref="/creator/settings" />;
  }
  if (!settings) redirect("/login");
  const t = await getTranslations("settings.creator");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <CreatorSettingsView
        settings={settings}
        isDemo={isDemoEmail(settings.email)}
        recommendedCents={recommendPrice(settings.followers, settings.industries, settings.engagementRate)}
      />
    </>
  );
}
