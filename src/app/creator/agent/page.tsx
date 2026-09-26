import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/page/PageHeader";
import { BRAND } from "@/config/brand";
import { AgentView } from "@/features/agent/components/AgentView";
import { AGENT_MODE } from "@/features/agent/flag";
import { listNotes, listThreads } from "@/features/agent/server/memory";
import { getViewer } from "@/features/auth/server/session";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${(await getTranslations("agent"))("title")} · ${BRAND.wordmark}` };
}

// The agent, for the creator: a conversation that shows its steps and asks
// before money moves. Off unless NEXT_PUBLIC_FF_AGENT_MODE=1.
export default async function CreatorAgentPage() {
  if (!AGENT_MODE) notFound();
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  const [t, notes, threads] = await Promise.all([getTranslations("agent"), listNotes(viewer.userId), listThreads(viewer.userId)]);
  const profile = [{ label: t("rail.handle"), value: `@${viewer.creator.handle}` }, { label: t("rail.headline"), value: viewer.creator.headline }];
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AgentView role="creator" firstName={viewer.firstName} csrfToken={viewer.csrfToken} profile={profile} notes={notes} threads={threads.map((th) => ({ id: th.id, title: th.title, kind: th.kind }))} />
    </>
  );
}
