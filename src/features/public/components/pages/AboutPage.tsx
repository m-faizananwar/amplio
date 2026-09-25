import { ABOUT_PAGE } from "../../page-copy";
import { CreatorAvatar } from "../shared/CreatorAvatar";
import { CtaSection } from "../shared/CtaSection";
import { LedMetricCard } from "../shared/LedMetricCard";
import { PageHero } from "../shared/PageHero";

export function AboutPage() {
  return (
    <>
      <PageHero eyebrow={ABOUT_PAGE.hero.eyebrow} title={ABOUT_PAGE.hero.title} sub={ABOUT_PAGE.hero.sub} tone="plain">
        <ul className="mt-14 flex flex-wrap justify-center gap-10">
          {ABOUT_PAGE.founders.map((founder) => (
            <li key={founder.name} className="flex flex-col items-center">
              <CreatorAvatar name={founder.name} className="size-28 ring-4 ring-border/40" />
              <p className="mt-4 font-semibold">{founder.first}</p>
              <p className="text-sm text-muted-foreground">{founder.role}</p>
            </li>
          ))}
        </ul>
      </PageHero>
      {/* the founding story and the facts: the one ink section, paper either side */}
      <section className="section-ink px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{ABOUT_PAGE.started.eyebrow}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">{ABOUT_PAGE.started.title}</h2>
          <div className="mt-8 space-y-4 text-lg text-foreground/80">
            {ABOUT_PAGE.started.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT_PAGE.facts.map((fact) => (
              <LedMetricCard key={fact.label} value={fact.value} label={fact.label} />
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{ABOUT_PAGE.mission.eyebrow}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">{ABOUT_PAGE.mission.title}</h2>
          <p className="mt-8 text-lg text-foreground/80">{ABOUT_PAGE.mission.lead}</p>
          <ul className="mt-4 space-y-3">
            {ABOUT_PAGE.mission.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-lg text-foreground/80">
                <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
