import { ChevronLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import type { CampaignShellDto } from "../../schemas";
import { CampaignSwitcher } from "./CampaignSwitcher";
import { DeleteCampaignButton } from "./DeleteCampaignButton";
import { type CampaignTabKey, CampaignTabs, tabPath } from "./CampaignTabs";

type Props = { shell: CampaignShellDto; tab: CampaignTabKey; children: React.ReactNode };
const TONE = { draft: "attention", active: "money", completed: "neutral" } as const;

// Every campaign section opens the same way: back to the list, the name and
// its state, the next step (finish setup, or invite a creator), and the
// projection from Amplio's own data next to what actually happened.
export async function CampaignHeader({ shell, tab, children }: Props) {
  const t = await getTranslations("brand.campaigns.detail");
  const tl = await getTranslations("brand.campaigns.list");
  const format = await getFormatter();
  const { campaign, summaries, projection } = shell;
  const estimate = projection?.estimate;
  return (
    <>
      <Link href="/brand/campaigns" className="mb-3 inline-flex items-center gap-1 text-small text-ink-muted hover:text-ink"><ChevronLeft className="size-4" aria-hidden="true" />{t("back")}</Link>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-h3">{campaign.name}</h1>
          <StatusChip tone={TONE[campaign.status]}>{tl(`status.${campaign.status}`)}</StatusChip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CampaignSwitcher current={campaign.id} summaries={summaries} tab={tabPath(tab)} />
          <DeleteCampaignButton campaignId={campaign.id} />
          {campaign.status === "draft"
            ? <Link href={`/brand/campaigns/${campaign.id}/launch`} className={buttonVariants({ size: "sm" })}>{t("continue")}</Link>
            : <Link href={`/brand/creators?campaign=${campaign.id}`} className={buttonVariants({ size: "sm" })}><UserPlus aria-hidden="true" />{t("invite")}</Link>}
        </div>
      </div>
      {projection && estimate ? (
        <p className="mb-6 text-small text-ink-muted">
          {estimate.estClicks === null
            ? t("projection.notEnough", { posts: estimate.sample.livePosts })
            : t("projection.line", { clicks: format.number(estimate.estClicks), creators: estimate.creators, posts: estimate.sample.livePosts })}
          {" · "}{t("projection.actual", { clicks: format.number(projection.actualClicks) })}
        </p>
      ) : <div className="mb-6" />}
      <CampaignTabs campaignId={campaign.id} active={tab} />
      <div className="mt-6">{children}</div>
    </>
  );
}
