import { ExternalLink, Mail, Share2 } from "lucide-react";
import type { ReactNode } from "react";
import { getFormatter, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AFFILIATE_MONTHS, AFFILIATE_SHARE_PERCENT, PLATFORM_COMMISSION_PERCENT } from "../../constants";
import type { AffiliateSummary } from "../../server/affiliate-queries";
import { CopyLinkButton } from "../CopyLinkButton";

type Props = { dealUrl: string; referralUrl: string; affiliate: AffiliateSummary };

const CENTS = 100;

function LinkRow({ title, description, url, children }: { title: string; description: string; url: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 p-5">
      <div>
        <h3 className="text-lead font-semibold">{title}</h3>
        <p className="text-small text-ink-muted">{description}</p>
      </div>
      <p className="num truncate rounded-control border border-rule bg-paper px-3 py-2 text-small text-ink">{url}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

type Figure = { label: string; value: string; money?: boolean; hint?: string };

function Figures({ figures }: { figures: Figure[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
      {figures.map((f) => (
        <div key={f.label}>
          <dt className="text-caption text-ink-muted">{f.label}</dt>
          <dd className={`num mt-0.5 text-lead ${f.money ? "text-money" : "text-ink"}`}>{f.value}</dd>
          {f.hint ? <dd className="text-caption text-ink-muted">{f.hint}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<"creator.card.links">>>;

// The brands the creator brought in, with what each has paid them so far.
function Introduced({ brands, t, money, date }: { brands: AffiliateSummary["brands"]; t: T; money: (c: number) => string; date: (iso: string) => string }) {
  if (brands.length === 0) return <EmptyState size="compact" title={t("empty.title")} body={t("empty.body")} />;
  return (
    <>
      <h3 className="text-small font-medium text-ink">{t("introduced.title")}</h3>
      <ul className="list-stagger mt-2 divide-y divide-rule">
        {brands.map((b) => (
          <li key={b.company + b.joinedAt} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-small">
            <span><span className="font-medium text-ink">{b.company}</span> <span className="text-ink-muted">· {t("introduced.joined", { date: date(b.joinedAt) })}</span></span>
            <span className="num text-ink-muted">
              {t("introduced.paid", { count: b.paidCollaborations })} · {t("introduced.reward", { amount: money(b.rewardCents) })} · {b.windowEndsAt ? t("introduced.windowEnds", { date: date(b.windowEndsAt) }) : t("introduced.windowNotStarted")}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

// "Your links": the deal link (the public card) and the referral link, with
// what the referrals have earned. Affiliate program, folded into My card.
export async function LinksSection({ dealUrl, referralUrl, affiliate }: Props) {
  const [t, tc, format] = await Promise.all([getTranslations("creator.card.links"), getTranslations("creator.common"), getFormatter()]);
  const money = (cents: number) => format.number(cents / CENTS, { style: "currency", currency: "EUR" });
  const shareLinkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(dealUrl)}`;
  const mail = `mailto:?subject=${encodeURIComponent(t("deal.emailSubject"))}&body=${encodeURIComponent(`${t("deal.shareText")}\n${dealUrl}`)}`;
  const figures: Figure[] = [
    { label: t("numbers.rewardsEarned"), value: money(affiliate.rewardsCents), money: true },
    { label: t("numbers.brandsIntroduced"), value: format.number(affiliate.brandsIntroduced) },
    { label: t("numbers.brandsRewarding"), value: format.number(affiliate.brandsRewarding) },
    { label: t("numbers.earningNow"), value: format.number(affiliate.earningNow), hint: t("numbers.earningNowHint", { months: AFFILIATE_MONTHS }) },
  ];
  return (
    <section id="links" aria-labelledby="links-title" className="scroll-mt-24 rounded-card border border-rule bg-surface">
      <header className="border-b border-rule p-5">
        <h2 id="links-title" className="text-h4">{t("title")}</h2>
        <p className="text-small text-ink-muted">{t("description")}</p>
      </header>
      <div className="divide-y divide-rule">
        <LinkRow title={t("deal.title")} description={`${t("deal.description")} ${t("deal.hint")}`} url={dealUrl}>
          <CopyLinkButton value={dealUrl} label={t("deal.copy")} copied={t("deal.copied")} failed={tc("copyFailed")} variant="primary" />
          <a href={dealUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary" })}><ExternalLink aria-hidden="true" />{t("deal.open")}</a>
          <a href={shareLinkedin} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost" })}><Share2 aria-hidden="true" />{t("deal.shareLinkedin")}</a>
          <a href={mail} className={buttonVariants({ variant: "ghost" })}><Mail aria-hidden="true" />{t("deal.shareEmail")}</a>
        </LinkRow>
        <LinkRow title={t("referral.title")} description={t("referral.description")} url={referralUrl}>
          <CopyLinkButton value={referralUrl} label={t("referral.copy")} copied={t("referral.copied")} failed={tc("copyFailed")} />
        </LinkRow>
        <Figures figures={figures} />
        <div className="p-5">
          <Introduced brands={affiliate.brands} t={t} money={money} date={(iso) => format.dateTime(new Date(iso), { dateStyle: "medium" })} />
          <p className="mt-4 text-caption text-ink-muted">{t("terms", { percent: AFFILIATE_SHARE_PERCENT, months: AFFILIATE_MONTHS, commission: PLATFORM_COMMISSION_PERCENT })}</p>
        </div>
      </div>
    </section>
  );
}
