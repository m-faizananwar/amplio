import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getViewer } from "@/features/auth/server/session";
import { BrandAudienceForm } from "@/features/workspace/components/settings/BrandAudienceForm";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BrandProfileForm } from "@/features/workspace/components/settings/BrandProfileForm";
import { DeleteAccountButton } from "@/features/workspace/components/settings/DeleteAccountButton";
import { TeamAccessPanel } from "@/features/workspace/components/settings/TeamAccessPanel";
import { getBrandSettings } from "@/features/workspace/server/settings-queries";
import type { BrandAudienceInput } from "@/features/workspace/schemas";

import { BRAND } from "@/config/brand";
import { isDemoEmail } from "@/features/auth/constants";
export const metadata: Metadata = { title: `Settings · ${BRAND.wordmark}` };

export default async function BrandSettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.brand) redirect("/login");
  const settings = await getBrandSettings(viewer.brand.id);
  if (!settings) redirect("/login");
  const { tab } = await searchParams;
  return (
    <>
      <PageHeader eyebrow={`${BRAND.name} workspace`} title="Settings" description="Manage your company profile and the audience you want to reach." />
      <Tabs defaultValue={tab === "audience" || tab === "team" || tab === "integrations" ? tab : "profile"}>
        <TabsList className="h-auto max-w-full flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="team">Team &amp; access</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="rounded-2xl border bg-background p-5">
          <BrandProfileForm defaults={{ company: settings.company, website: settings.website, valueProp: settings.valueProp }} />
        </TabsContent>
        <TabsContent value="audience" className="rounded-2xl border bg-background p-5">
          <BrandAudienceForm
            defaults={{ targetIndustries: settings.targetIndustries, targetRegions: settings.targetRegions } as BrandAudienceInput}
            icps={settings.icps}
          />
        </TabsContent>
        <TabsContent value="team" className="rounded-2xl border bg-background p-5">
          <TeamAccessPanel owner={settings.owner} />
        </TabsContent>
        <TabsContent value="integrations" className="grid gap-3 rounded-2xl border bg-background p-5">
          <h2 className="font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground">The remote MCP endpoint, the pixel and your site key live on their own pages.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/brand/integrations" className={buttonVariants({ variant: "outline" })}>Open Integrations</Link>
            <Link href="/brand/results" className={buttonVariants({ variant: "outline" })}>Pixel &amp; site key (Results)</Link>
          </div>
        </TabsContent>
      </Tabs>
      <section className="mt-6 rounded-2xl border border-destructive/30 bg-background p-5">
        <h2 className="font-semibold">Delete account</h2>
        <p className="mb-3 text-sm text-muted-foreground">Removes the workspace, its campaigns, collaborations and ledger. Demo accounts are protected.</p>
        <DeleteAccountButton isDemo={isDemoEmail(viewer.email)} />
      </section>
    </>
  );
}
