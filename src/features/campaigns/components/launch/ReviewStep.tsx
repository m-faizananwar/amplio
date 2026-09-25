import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import type { CampaignDto, CreatorPickDto, EstimateDto } from "../../schemas";
import { CreatorRow } from "../detail/CreatorRow";
import { EstimatorCard } from "../EstimatorCard";
import { LaunchButton } from "./LaunchButton";

type Props = { campaign: CampaignDto; creators: CreatorPickDto[]; estimate: EstimateDto; walletCents: number };
const CENTS = 100;

// Before anything is sent: the campaign in one card, who gets invited and
// what that holds from the wallet, what Amplio's own data says to expect.
export async function ReviewStep({ campaign, creators, estimate, walletCents }: Props) {
  const t = await getTranslations("brand.campaigns.launch.review");
  const format = await getFormatter();
  const base = `/brand/campaigns/${campaign.id}/launch`;
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  const short = estimate.totalSpendCents > walletCents;
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-card border border-rule bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="text-lead">{campaign.name}</h3><p className="text-small text-ink-muted">{campaign.description}</p></div>
          <Link href={`${base}?step=basics`} className="text-small font-medium text-ink hover:underline">{t("edit")}</Link>
        </div>
        <dl className="grid gap-3 text-small sm:grid-cols-3">
          <div><dt className="text-caption text-ink-muted">{t("deadline")}</dt><dd className="num">{campaign.postDeadline ? format.dateTime(new Date(campaign.postDeadline), { day: "numeric", month: "short", year: "numeric" }) : t("noDeadline")}</dd></div>
          <div><dt className="text-caption text-ink-muted">{t("fee")}</dt><dd className="num">{euros(campaign.defaultFeeCents)}</dd></div>
          <div><dt className="text-caption text-ink-muted">{t("brief")}</dt><dd>{t("angles", { count: campaign.brief.angles.length })} · <Link href={`${base}?step=brief`} className="text-info hover:underline">{t("editBrief")}</Link></dd></div>
        </dl>
      </section>
      <section className="grid gap-2 rounded-card border border-rule bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lead">{t("toInvite", { count: creators.length })}</h3>
          <Link href={`${base}?step=creators`} className="text-small font-medium text-ink hover:underline">{t("change")}</Link>
        </div>
        {creators.length === 0 ? <p className="text-small text-ink-muted">{t("noneSelected")}</p> : (
          <ul className="divide-y divide-rule">{creators.map((c) => <li key={c.id}><CreatorRow creator={c} /></li>)}</ul>
        )}
        <p className={`num mt-2 text-small ${short ? "text-attention" : "text-ink-muted"}`}>{t(short ? "heldShort" : "held", { total: euros(estimate.totalSpendCents), wallet: euros(walletCents) })}</p>
      </section>
      <EstimatorCard estimate={estimate} />
      <div className="flex flex-wrap items-center gap-2">
        <LaunchButton campaignId={campaign.id} creatorIds={creators.map((c) => c.id)} />
        <Link href={`${base}?step=creators`} className={buttonVariants({ variant: "ghost" })}>{t("back")}</Link>
      </div>
    </div>
  );
}
