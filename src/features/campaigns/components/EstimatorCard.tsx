import { formatCents } from "@/lib/money";
import type { EstimateDto } from "../schemas";

function Metric({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className={value === null ? "mt-1 text-small text-ink-muted" : "num mt-1 text-h4 font-semibold"}>{value ?? "Not enough data yet"}</dd>
    </div>
  );
}

const count = (n: number | null) => (n === null ? null : n.toLocaleString("en-GB"));
const euros = (c: number | null) => (c === null ? null : formatCents(c, "EUR"));

// Pre-spend estimate for a creator selection, from Amplio's own live posts
// (src/lib/estimator.ts). Where the sample is too small it says so.
export function EstimatorCard({ estimate }: { estimate: EstimateDto }) {
  const { sample } = estimate;
  return (
    <section aria-labelledby="estimator-title" className="rounded-card border border-rule bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="estimator-title" className="text-lead">What to expect</h2>
        {estimate.confidence ? <span className="rounded-chip bg-tint px-2.5 py-0.5 text-caption text-ink-muted">Confidence {estimate.confidence}</span> : null}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Metric label="Est. clicks" value={count(estimate.estClicks)} />
        <Metric label="Est. sign-ups" value={count(estimate.estLeads)} />
        <Metric label="Est. cost per sign-up" value={euros(estimate.estCplCents)} />
        <Metric label="Est. cost per click" value={euros(estimate.estCpcCents)} />
        <Metric label="Total spend" value={euros(estimate.totalSpendCents)} />
      </dl>
      <p className="mt-4 text-caption text-ink-muted">
        From Amplio&apos;s own data: <span className="num">{sample.livePosts}</span> live posts, <span className="num">{sample.clicks}</span> clicks,{" "}
        <span className="num">{sample.signups}</span> attributed sign-ups. {estimate.creatorsWithReach} of {estimate.creators} selected creators have reach data.
      </p>
    </section>
  );
}
