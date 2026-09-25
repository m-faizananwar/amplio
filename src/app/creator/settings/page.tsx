import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getViewer } from "@/features/auth/server/session";
import { CreatorProfileForm } from "@/features/workspace/components/settings/CreatorProfileForm";
import { DeleteAccountButton } from "@/features/workspace/components/settings/DeleteAccountButton";
import { PayoutDetailsForm } from "@/features/workspace/components/settings/PayoutDetailsForm";
import { getCreatorSettings } from "@/features/workspace/server/settings-queries";
import type { CreatorProfileInput } from "@/features/workspace/schemas";

import { BRAND } from "@/config/brand";
import { isDemoEmail } from "@/features/auth/constants";
export const metadata: Metadata = { title: `Settings · ${BRAND.wordmark}` };

export default async function CreatorSettingsPage() {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  const settings = await getCreatorSettings(viewer.creator.id);
  if (!settings) redirect("/login");
  const defaults = {
    firstName: settings.firstName,
    lastName: settings.lastName,
    headline: settings.headline,
    linkedinUrl: settings.linkedinUrl,
    industries: settings.industries,
    priceCents: settings.priceCents,
    xHandle: settings.xHandle,
  } as CreatorProfileInput;
  return (
    <>
      <PageHeader title="Settings" description="Profile · Payments · Account" />
      <Tabs defaultValue="profile">
        <TabsList className="h-auto max-w-full flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="rounded-2xl border bg-background p-5">
          <CreatorProfileForm defaults={defaults} />
        </TabsContent>
        <TabsContent value="payments" className="rounded-2xl border bg-background p-5">
          <PayoutDetailsForm defaults={settings.payout} />
        </TabsContent>
        <TabsContent value="account" className="grid gap-4 rounded-2xl border bg-background p-5">
          <div>
            <h2 className="font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">Signed in as {settings.email} · card handle @{settings.handle}</p>
          </div>
          <div>
            <DeleteAccountButton isDemo={isDemoEmail(settings.email)} />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
