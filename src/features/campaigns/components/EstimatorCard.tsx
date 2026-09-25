import { getFormatter, getTranslations } from "next-intl/server";
import type { EstimateDto } from "../schemas";

const CENTS = 100;

// What to expect from this selection, from Amplio's own live posts
// (src/lib/estimator.ts). Where the sample is too small it says so rather
// than show a number it can't back.
export async function EstimatorCard({ estimate: e }: { estimate: EstimateDto }) {
  const t = await getTranslations("brand.campaigns.estimator");
  const format = await getFormatter();
  const count = (n: number | null) => (n === null ? null : format.number(n));
  const euros = (c: number | null) => (c === null ? null : format.number(c / CENTS, { style: "currency", currency: "EUR" }));
  const metrics: Array<[string, string | null]> = [
    [t("clicks"), count(e.estClicks)], [t("signups"), count(e.estLeads)], [t("perSignup"), euros(e.estCplCents)], [t("perClick"), euros(e.estCpcCents)], [t("spend"), euros(e.totalSpendCents)],
  ];
  return (
    <section aria-labelledby="estimator-title" className="grid gap-4 rounded-card border border-rule bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="estimator-title" className="text-lead">{t("title")}</h3>
        {e.confidence ? <span className="rounded-chip bg-tint px-2.5 py-0.5 text-caption text-ink-muted">{t(`confidence.${e.confidence}`)}</span> : null}
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label}><dt className="text-caption text-ink-muted">{label}</dt><dd className={value === null ? "mt-1 text-small text-ink-muted" : "num mt-1 text-h4"}>{value ?? t("notEnough")}</dd></div>
        ))}
      </dl>
      <p className="text-caption text-ink-muted">{t("source", { posts: e.sample.livePosts, clicks: e.sample.clicks, signups: e.sample.signups, withReach: e.creatorsWithReach, creators: e.creators })}</p>
    </section>
  );
}
