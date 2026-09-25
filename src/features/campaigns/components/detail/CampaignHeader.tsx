import { ChevronLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CAMPAIGN_STATUS_LABEL } from "../../constants";
import type { CampaignShellDto } from "../../schemas";
import { CampaignSwitcher } from "./CampaignSwitcher";
import { DeleteCampaignButton } from "./DeleteCampaignButton";
import { type CampaignTabKey, CampaignTabs, tabPath } from "./CampaignTabs";

type Props = { shell: CampaignShellDto; tab: CampaignTabKey; children: React.ReactNode };

const STATUS_VARIANT = { draft: "outline", active: "default", completed: "secondary" } as const;

// Header + tabs around every campaign detail tab.
export function CampaignHeader({ shell, tab, children }: Props) {
  const { campaign, summaries, projection } = shell;
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/brand/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" aria-hidden="true" /> Campaigns
          </Link>
          <span className="text-muted-foreground" aria-hidden="true">
            ·
          </span>
          <h1 className="truncate text-xl font-semibold tracking-tight">{campaign.name}</h1>
          <Badge variant={STATUS_VARIANT[campaign.status]}>{CAMPAIGN_STATUS_LABEL[campaign.status]}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CampaignSwitcher current={campaign.id} summaries={summaries} tab={tabPath(tab)} />
          {campaign.status === "draft" ? (
            <Link href={`/brand/campaigns/${campaign.id}/launch`} className={buttonVariants({ className: "bg-brand text-brand-foreground hover:bg-brand/90" })}>
              Continue setup
            </Link>
          ) : (
            <Link href={`/brand/creators?campaign=${campaign.id}`} className={buttonVariants({ className: "bg-brand text-brand-foreground hover:bg-brand/90" })}>
              <UserPlus data-icon="inline-start" aria-hidden="true" /> Invite a creator
            </Link>
          )}
          <DeleteCampaignButton campaignId={campaign.id} name={campaign.name} />
        </div>
      </div>
      {projection ? (
        <p className="mb-4 text-small text-ink-muted">
          {projection.estimate.estClicks === null ? (
            <>Projection: not enough live posts on Amplio yet ({projection.estimate.sample.livePosts})</>
          ) : (
            <><span className="font-medium text-ink">Projected</span> <span className="num">{projection.estimate.estClicks.toLocaleString("en-GB")}</span> clicks from {projection.estimate.creators} {projection.estimate.creators === 1 ? "creator" : "creators"} · based on <span className="num">{projection.estimate.sample.livePosts}</span> live posts</>
          )}
          {" · "}<span className="font-medium text-ink">Actual</span> <span className="num">{projection.actualClicks.toLocaleString("en-GB")}</span> so far
        </p>
      ) : null}
      <CampaignTabs campaignId={campaign.id} active={tab} />
      <div className="mt-6">{children}</div>
    </>
  );
}
