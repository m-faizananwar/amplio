import { BENCHMARKS } from "../../benchmarks-data";
import { CtaSection } from "../shared/CtaSection";
import { DataTable } from "../shared/DataTable";
import { PageHero } from "../shared/PageHero";
import { LedMetricCard } from "../shared/LedMetricCard";
import { BenchmarksCaveats } from "./BenchmarksCaveats";
import { BenchmarksMethodology } from "./BenchmarksMethodology";

import { BRAND } from "@/config/brand";
function Block({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <section className="border-t py-12">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-4 text-lg text-foreground/75">{body}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function BenchmarksPage() {
  const b = BENCHMARKS;
  return (
    <>
      <PageHero tone="navy" align="left" eyebrow={b.hero.eyebrow} title={b.hero.title} sub={b.hero.sub}>
        <p className="mt-8 text-sm text-background/60">{b.hero.meta}</p>
      </PageHero>
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="rounded-2xl bg-muted/60 p-5 text-sm text-foreground/80 ring-1 ring-border/60">{b.editorialNote}</p>
        <p className="mt-10 text-xl text-foreground/85">{b.intro}</p>
        <section className="mt-12 border-t py-12">
          <h2 className="text-3xl font-semibold tracking-tight">Executive summary</h2>
          <ul className="mt-6 space-y-4">
            {b.summary.map((line) => (
              <li key={line} className="flex gap-3 text-lg text-foreground/80">
                <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-brand" />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {b.headline.map((stat) => (
              <LedMetricCard key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </section>
        <BenchmarksMethodology />
      </article>
      {/* the comparison table is what the page is cited for: the one ink section */}
      <section className="section-ink px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold tracking-tight">{b.vsAds.title}</h2>
          <p className="mt-4 text-lg text-foreground/75">{b.vsAds.body}</p>
          <div className="mt-8">
            <DataTable columns={b.vsAds.columns} rows={b.vsAds.rows} caption={`${BRAND.name} versus LinkedIn Ads benchmarks`} />
            <p className="mt-4 text-sm text-muted-foreground">{b.vsAds.footnote}</p>
          </div>
        </div>
      </section>
      <article className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <Block title={b.ctrByTier.title} body={b.ctrByTier.body}>
          <DataTable columns={b.ctrByTier.columns} rows={b.ctrByTier.rows} caption="Median CTR by creator follower tier" />
        </Block>
        <Block title={b.cplByVertical.title} body={b.cplByVertical.body}>
          <DataTable columns={b.cplByVertical.columns} rows={b.cplByVertical.rows} caption="Cost per lead by vertical" />
        </Block>
        <Block title={b.funnel.title} body={b.funnel.body}>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {b.funnel.steps.map((step) => (
              <li key={step.label}>
                <LedMetricCard value={step.value} label={step.label} />
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">{b.funnel.note}</p>
        </Block>
        <BenchmarksCaveats />
      </article>
      <CtaSection />
    </>
  );
}
