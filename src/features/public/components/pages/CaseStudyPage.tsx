import { Check, Play } from "lucide-react";
import { CASE_STUDY_PAGE } from "../../page-copy";
import { cn } from "cn";
import { HERO_POSTER } from "../hero/hero-config";
import { CreatorAvatar } from "../shared/CreatorAvatar";
import { interTight } from "../shared/display-font";
import { CtaSection } from "../shared/CtaSection";
import { LinkedInMark } from "../shared/LinkedInMark";
import { LedMetricCard } from "../shared/LedMetricCard";
import { CaseStudyNarrative } from "./CaseStudyNarrative";

function Stats({ items }: { items: readonly { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <LedMetricCard key={item.label} value={item.value} label={item.label} />
      ))}
    </div>
  );
}

export function CaseStudyPage() {
  const c = CASE_STUDY_PAGE;
  return (
    <>
      <section className={cn("page-hero relative -mt-16 overflow-hidden px-4 pb-16 pt-32 sm:px-6", interTight.className)}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.28] blur-[2px]" style={{ backgroundImage: `url(${HERO_POSTER})` }} />
        <div aria-hidden="true" className="page-hero-wash pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <p className="page-hero-eyebrow text-[12.5px] uppercase tracking-[0.18em]">{c.eyebrow}</p>
            <p className="mt-4 text-2xl font-bold tracking-tight">{c.brand}</p>
            <h1 className="mt-4 text-[clamp(38px,5.4vw,72px)] font-normal leading-[0.98] tracking-[-0.036em] [text-wrap:balance]">{c.title}</h1>
            <p className="page-hero-muted mt-6 text-lg">{c.sub}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium">
              <LinkedInMark />
              {c.tags}
            </p>
          </div>
          <div className="relative flex aspect-4/5 flex-col justify-end overflow-hidden rounded-[2rem] bg-foreground p-6 text-background" aria-label="Video testimonial poster">
            <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <span className="flex size-16 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md">
                <Play className="ml-1 size-6 fill-current" />
              </span>
            </span>
            <p className="font-semibold">{c.video.name}</p>
            <p className="text-sm text-background/70">{c.video.role}</p>
            <p className="mt-2 text-xs text-background/50">Video poster · no playback in this build</p>
          </div>
        </div>
      </section>
      {/* the numbers are what this page is for: the one ink section (paper either side) */}
      <section className="section-ink px-4 sm:px-6" data-morph-group>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl" data-morph="text">{c.resultsTitle}</h2>
          <div className="mt-10" data-morph><Stats items={c.headline} /></div>
          <div className="mt-4" data-morph><Stats items={c.detail} /></div>
        </div>
      </section>
      <CaseStudyNarrative />
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <p className="text-xs text-muted-foreground">{c.why.n}</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">{c.why.title}</h2>
            <p className="mt-3 text-muted-foreground">{c.why.sub}</p>
          </div>
          <ul className="mt-8 divide-y border-y lg:mt-0">
            {c.why.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 py-4 text-lg">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <figure className="mx-auto mt-20 max-w-3xl text-center">
          <blockquote className="text-2xl font-semibold tracking-tight sm:text-3xl">“{c.quote.text}”</blockquote>
          <figcaption className="mt-6 flex flex-col items-center">
            <CreatorAvatar name={c.quote.author} className="size-12" />
            <p className="mt-2 font-semibold">{c.quote.author}</p>
            <p className="text-sm text-muted-foreground">{c.quote.role}</p>
          </figcaption>
        </figure>
      </section>
      <CtaSection />
    </>
  );
}
