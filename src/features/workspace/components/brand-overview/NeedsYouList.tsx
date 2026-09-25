import { ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { PersonAvatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { JoiningDotsScene } from "@/components/graphics/scenes";
import { EmptyState } from "@/components/ui/empty-state";
import type { CollaborationDto } from "@/features/collaborations/schemas";

const CENTS = 100;
const SHOWN = 6;

type Props = { items: CollaborationDto[]; lowWalletCents: number | null };

// The things waiting on this brand, most urgent first — each a row with the
// next step in words and the button that does it. A low wallet sits on top:
// it blocks every new invitation.
export async function NeedsYouList({ items, lowWalletCents }: Props) {
  const t = await getTranslations("brand.overview.needsYou");
  const tc = await getTranslations("collaboration");
  const format = await getFormatter();
  const euros = (cents: number) => format.number(cents / CENTS, { style: "currency", currency: "EUR" });
  if (items.length === 0 && lowWalletCents === null) {
    return <EmptyState illustration={<JoiningDotsScene />} title={t("empty.title")} body={t("empty.body")} action={<Link href="/brand/creators" className={buttonVariants({ variant: "secondary" })}>{t("empty.action")}</Link>} />;
  }
  return (
    <div className="grid gap-3">
      <ol className="divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface">
        {lowWalletCents !== null ? (
          <li className="flex flex-wrap items-center gap-3 px-5 py-4 animate-rise">
            <span className="grid size-8 place-items-center rounded-full bg-attention-soft text-attention" aria-hidden="true"><Wallet className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink">{t("lowWallet.title", { amount: euros(lowWalletCents) })}</span>
              <span className="block text-small text-ink-muted">{t("lowWallet.body")}</span>
            </span>
            <Link href="/brand/billing" className={buttonVariants({ size: "sm" })}>{t("lowWallet.action")}</Link>
          </li>
        ) : null}
        {items.slice(0, SHOWN).map((c, i) => {
          const vars = { creator: c.creatorName, brand: c.brandCompany, round: c.revisionRound, max: c.maxRevisionRounds, amount: euros(c.feeCents) };
          return (
            <li key={c.id} className="animate-rise" style={{ animationDelay: `${(i + 1) * 20}ms` }}>
              <Link href={`/brand/collaborations/${c.id}`} className="group flex flex-wrap items-center gap-3 px-5 py-4 outline-none transition-colors duration-(--duration-fast) ease-ledger hover:bg-tint focus-visible:bg-tint">
                <PersonAvatar name={c.creatorName} src={c.creatorAvatarUrl} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{tc(`nextAction.brand.${c.status}.action`, vars)}</span>
                  <span className="block truncate text-small text-ink-muted">{c.creatorName} · {c.campaignName}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-small font-medium text-ink">
                  {t(`cta.${c.status}`)}
                  <ArrowRight className="size-3.5 transition-transform duration-(--duration-fast) ease-ledger group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {items.length > SHOWN ? (
        <Link href="/brand/collaborations" className="justify-self-start text-small font-medium text-ink underline-offset-4 hover:underline">{t("more", { count: items.length - SHOWN })}</Link>
      ) : null}
    </div>
  );
}
