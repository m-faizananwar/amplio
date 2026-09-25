import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { isDemoEmail } from "@/features/auth/constants";
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
    return <ErrorState body="We could not load your settings. Try again in a moment." retryHref="/creator/settings" />;
  }
  if (!settings) redirect("/login");
  return (
    <>
      <header className="mb-8">
        <h1 className="text-h2">Settings</h1>
        <p className="mt-1 text-ink-muted">The same fields you filled in when you joined. Each section saves on its own.</p>
      </header>
      <CreatorSettingsView
        settings={settings}
        isDemo={isDemoEmail(settings.email)}
        recommendedCents={recommendPrice(settings.followers, settings.industries, settings.engagementRate)}
      />
    </>
  );
}
