import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { CreatorPickDto } from "../../schemas";
import { CreatorRow } from "./CreatorRow";
import { InviteButton } from "./InviteButton";

type Props = { campaignId: string; creators: CreatorPickDto[]; canInvite: boolean };

// The creators you saved, scored against this brief, each one click from an
// invitation once the campaign is live.
export async function ShortlistTab({ campaignId, creators, canInvite }: Props) {
  const t = await getTranslations("brand.campaigns.detail.shortlist");
  if (creators.length === 0) {
    return <EmptyState title={t("empty.title")} body={t("empty.body")} action={<Link href={`/brand/creators?campaign=${campaignId}`} className={buttonVariants({ variant: "secondary" })}>{t("empty.action")}</Link>} />;
  }
  return (
    <div className="grid gap-3">
      {!canInvite ? <p className="rounded-control bg-attention-soft px-3 py-2 text-small text-ink">{t("launchFirst")}</p> : null}
      <ul className="divide-y divide-rule rounded-card border border-rule bg-surface px-5">
        {creators.map((creator) => (
          <li key={creator.id}>
            <CreatorRow creator={creator} action={canInvite ? <InviteButton campaignId={campaignId} creatorId={creator.id} creatorName={creator.name} disabled={creator.alreadyInvited} /> : null} />
          </li>
        ))}
      </ul>
    </div>
  );
}
