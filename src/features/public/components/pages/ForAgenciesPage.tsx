import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { FOR_AGENCIES } from "../../page-copy";
import { GlassCard } from "../glass/GlassCard";
import { PageHero } from "../shared/PageHero";
import { PillLink } from "../shared/PillLink";

export function ForAgenciesPage() {
  const { hero, workspaces, call } = FOR_AGENCIES;
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} sub={hero.sub}>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <PillLink href={hero.cta.href} label={hero.cta.label} />
          <PillLink href="/case-study" label="See a campaign" variant="secondary" />
        </div>
      </PageHero>
      {/* the two ways to run client work: the one ink section */}
      <Reveal>
        <section id="workspaces" className="section-ink scroll-mt-20 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{workspaces.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{workspaces.title}</h2>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {workspaces.options.map((option, index) => (
                <GlassCard key={option.n} title={option.title} index={index + 1} order={index} className="p-8 sm:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{option.kind}</p>
                  <p className="mt-3 text-muted-foreground">{option.body}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {option.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2.5 text-sm">
                        <Check className="size-4 text-foreground/70" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Link href={option.cta.href} className="mt-8 inline-flex items-center gap-2 font-semibold text-foreground hover:underline">
                    {option.cta.label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <p className="mt-2 text-xs text-muted-foreground">{option.note}</p>
                </GlassCard>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">{FOR_AGENCIES.buildNote}</p>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="bg-muted/40 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{call.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{call.title}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{call.body}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PillLink href={call.cta.href} label={call.cta.label} />
              <PillLink href="/pricing" label="See pricing" variant="secondary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{call.note}</p>
          </div>
        </section>
      </Reveal>
    </>
  );
}
