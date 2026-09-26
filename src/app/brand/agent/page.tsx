import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/page/PageHeader";
import { BRAND } from "@/config/brand";
import { AgentView } from "@/features/agent/components/AgentView";
import { AGENT_MODE } from "@/features/agent/flag";
import { listNotes, listThreads } from "@/features/agent/server/memory";
import { getViewer } from "@/features/auth/server/session";

export const metadata: Metadata = { title: `Agent · ${BRAND.wordmark}` };

// The agent, for the brand: a conversation that shows its steps and asks
// before money moves. Off unless NEXT_PUBLIC_FF_AGENT_MODE=1.
export default async function BrandAgentPage() {
  if (!AGENT_MODE) notFound();
  const viewer = await getViewer();
  if (!viewer?.brand) redirect("/login");
  const [t, notes, threads] = await Promise.all([getTranslations("agent"), listNotes(viewer.userId), listThreads(viewer.userId)]);
  const profile = [{ label: t("rail.company"), value: viewer.brand.company }];
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AgentView role="brand" firstName={viewer.firstName} csrfToken={viewer.csrfToken} profile={profile} notes={notes} threads={threads.map((th) => ({ id: th.id, title: th.title, kind: th.kind }))} />
    </>
  );
}
