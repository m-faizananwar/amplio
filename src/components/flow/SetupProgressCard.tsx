import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { getViewer } from "@/features/auth/server/session";
import { getBrandSetupProgress } from "@/features/brand-onboarding/server/setup-progress";
import { getCreatorSetupProgress } from "@/features/creator-onboarding/server/setup-progress";
import type { SetupProgress } from "@/lib/setup-steps";
import { SetupCardView } from "./SetupCardView";

const CELEBRATE_FOR_MS = 3 * 24 * 60 * 60 * 1000;

const HREF: Record<string, string> = {
  website: "/brand/setup?step=website", profile: "/brand/setup?step=profile",
  linkedin: "/creator/setup?step=linkedin", card: "/creator/setup?step=card", price: "/creator/setup?step=price", legal: "/creator/setup?step=legal",
};

// finished setups only get their one "You're set up" moment for a few days
function worthShowing(p: SetupProgress) {
  if (!p.finished) return true;
  return !!p.completedAt && Date.now() - new Date(p.completedAt).getTime() < CELEBRATE_FOR_MS;
}

// The Overview's one setup card, both roles, in two phases: while setup is
// unfinished, the setup ring; once it's done, "You're set up" once, then
// `then` (the brand's first steps) in its place.
export async function SetupProgressCard({ role, then = null }: { role: "brand" | "creator"; then?: ReactNode }) {
  const viewer = await getViewer();
  const owner = role === "brand" ? viewer?.brand : viewer?.creator;
  if (!viewer || !owner) return null;
  const progress = role === "brand" ? await getBrandSetupProgress(owner.id, owner.completedAt) : await getCreatorSetupProgress(owner.id, owner.completedAt);
  if (!progress) return then;
  if (!worthShowing(progress)) return progress.finished ? then : null;
  const t = await getTranslations("onboarding.setup");
  const next = progress.next && progress.next !== "account" ? progress.next : null;
  return (
    <SetupCardView
      seenKey={`amplio:setup-done:${viewer.userId}`}
      finished={progress.finished}
      done={progress.done}
      total={progress.total}
      steps={progress.steps.map((st) => ({ key: st.key, title: t(`steps.${st.key}.title`), done: st.done }))}
      next={next ? { title: t(`steps.${next}.title`), why: t(`steps.${next}.why`), href: HREF[next] } : null}
      then={then}
      labels={{ progress: t("card.progress", { done: progress.done, total: progress.total }), next: t("card.next", { step: "{step}" }), continue: t("card.continue"), doneTitle: t("card.doneTitle"), doneBody: t("card.doneBody") }}
    />
  );
}
