import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import type { CampaignCardDto } from "../../schemas";

const CENTS = 100;
const TONE = { draft: "attention", active: "money", completed: "neutral" } as const;

// Every campaign as one ruled row: name and what it's about, its state, the
// creators on it, what's published, what's committed — and the next step
// (a draft still needs its creators and launch).
export async function CampaignsLedger({ campaigns }: { campaigns: CampaignCardDto[] }) {
  const t = await getTranslations("brand.campaigns.list");
  const format = await getFormatter();
  if (campaigns.length === 0) {
    return <EmptyState title={t("empty.title")} body={t("empty.body")} action={<Link href="/brand/campaigns/new" className={buttonVariants()}>{t("empty.action")}</Link>} />;
  }
  return (
    <div className="overflow-hidden rounded-card border border-rule bg-surface">
      <div className="hidden grid-cols-[minmax(0,1.8fr)_7rem_5.5rem_5.5rem_7.5rem_8rem] gap-4 border-b border-rule px-5 py-2.5 text-caption text-ink-muted md:grid" aria-hidden="true">
        <span>{t("columns.campaign")}</span><span>{t("columns.status")}</span><span>{t("columns.creators")}</span><span>{t("columns.published")}</span><span className="text-right">{t("columns.committed")}</span><span />
      </div>
      <ol className="list-stagger divide-y divide-rule">
        {campaigns.map((c) => {
          const href = c.status === "draft" ? `/brand/campaigns/${c.id}/launch` : `/brand/campaigns/${c.id}`;
          return (
            <li key={c.id}>
              <Link href={href} className="group grid gap-2 px-5 py-4 outline-none transition-colors duration-(--duration-fast) ease-ledger hover:bg-tint focus-visible:bg-tint md:grid-cols-[minmax(0,1.8fr)_7rem_5.5rem_5.5rem_7.5rem_8rem] md:items-center md:gap-4">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{c.name}</span>
                  <span className="block truncate text-small text-ink-muted">{c.description || t("noDescription")}</span>
                </span>
                <span><StatusChip tone={TONE[c.status]}>{t(`status.${c.status}`)}</StatusChip></span>
                <span className="num text-small"><span className="text-ink-muted md:hidden">{t("columns.creators")} </span>{c.creators}</span>
                <span className="num text-small"><span className="text-ink-muted md:hidden">{t("columns.published")} </span>{c.published}</span>
                <span className="num text-small md:text-right">{format.number(c.committedCents / CENTS, { style: "currency", currency: "EUR" })}</span>
                <span className="inline-flex items-center gap-1 text-small font-medium text-ink md:justify-end">
                  {c.status === "draft" ? t("continue") : t("open")}
                  <ArrowRight className="size-3.5 transition-transform duration-(--duration-fast) ease-ledger group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
