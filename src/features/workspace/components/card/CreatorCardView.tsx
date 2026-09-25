import { getFormatter, getTranslations } from "next-intl/server";
import { getOptionLabel } from "@/i18n/option-label";
import { AudienceOrbit } from "@/components/graphics/AudienceOrbit";
import { PersonAvatar } from "@/components/ui/avatar";
import { COUNTRIES } from "@/features/creator-onboarding/constants";
import type { PublicCard } from "../../server/card-queries";
import { AudienceBars } from "./AudienceBars";

const PERCENT = 100;
const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code;

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="num mt-0.5 text-lead text-ink">{value}</dd>
    </div>
  );
}

function CardHeader({ card, industriesLabel, industry }: { card: PublicCard; industriesLabel: string; industry: (value: string) => string }) {
  return (
      <header className="flex items-start gap-4 border-b border-rule p-5">
        <AudienceOrbit followers={card.followers} topTitles={Object.entries(card.audienceJobTitles).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([title]) => title)}>
          <PersonAvatar name={card.name} src={card.avatarUrl} size="lg" />
        </AudienceOrbit>
        <div className="min-w-0">
          <h2 className="text-h4">{card.name}</h2>
          <p className="num text-caption text-ink-muted">@{card.handle} · {countryName(card.country)}</p>
          <p className="mt-2 text-body text-ink">{card.headline}</p>
          {card.industries.length > 0 ? (
            <ul aria-label={industriesLabel} className="mt-3 flex flex-wrap gap-1.5">
              {card.industries.map((i) => <li key={i} className="rounded-chip border border-rule px-2.5 py-0.5 text-caption text-ink-muted">{industry(i)}</li>)}
            </ul>
          ) : null}
        </div>
      </header>
  );
}

// The card as brands see it: who, the proof, the audience, the price. The
// same view on My card and on the public /c/[handle] page.
export async function CreatorCardView({ card }: { card: PublicCard }) {
  const [t, format, industry] = await Promise.all([getTranslations("creator.publicCard"), getFormatter(), getOptionLabel("industries")]);
  const n = (v: number) => format.number(v);
  const money = (cents: number) => format.number(cents / PERCENT, { style: "currency", currency: "EUR" });
  // audience mixes are stored as whole percentages (0–100)
  const pct = (share: number) => format.number(share / PERCENT, { style: "percent", maximumFractionDigits: 0 });
  return (
    <article className="rounded-card border border-rule bg-surface">
      <CardHeader card={card} industriesLabel={t("fields.industries")} industry={industry} />
      <section aria-label={t("sections.performance")} className="border-b border-rule p-5">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Figure label={t("fields.followers")} value={n(card.followers)} />
          <Figure label={t("fields.medianViews")} value={card.medianViews > 0 ? n(card.medianViews) : "—"} />
          <Figure label={t("fields.engagementRate")} value={card.engagementRate > 0 ? t("fields.engagementRateValue", { percent: format.number(card.engagementRate * PERCENT, { maximumFractionDigits: 1 }) }) : "—"} />
          <Figure label={t("fields.reactionsPerPost")} value={n(card.reactionsPerPost)} />
          <Figure label={t("fields.commentsPerPost")} value={n(card.commentsPerPost)} />
          <Figure label={t("fields.publishedCollaborations")} value={n(card.publishedCollaborations)} />
        </dl>
        <p className="mt-3 text-caption text-ink-muted">{t("fields.postsAnalyzed", { count: card.postsAnalyzed })}</p>
      </section>
      <section aria-label={t("sections.audience")} className="grid gap-5 border-b border-rule p-5 sm:grid-cols-2">
        <AudienceBars title={t("fields.audienceJobTitles")} mix={card.audienceJobTitles} percent={pct} />
        <AudienceBars title={t("fields.audienceSeniority")} mix={card.audienceSeniority} percent={pct} />
      </section>
      <section aria-label={t("sections.pricing")} className="flex flex-wrap items-baseline justify-between gap-3 p-5">
        <div>
          <p className="text-caption text-ink-muted">{t("fields.pricePerPost")}</p>
          <p className="num text-h3 text-money">{card.priceCents > 0 ? money(card.priceCents) : t("fields.noPrice")}</p>
        </div>
        {card.bundle ? <p className="num text-small text-ink-muted">{t("fields.bundle", { count: card.bundle.posts, amount: money(card.bundle.totalCents) })}</p> : null}
      </section>
    </article>
  );
}
