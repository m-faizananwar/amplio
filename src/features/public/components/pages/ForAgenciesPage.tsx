import { ArrowRight, CalendarDays, Check } from "lucide-react";
import Link from "next/link";
import { FOR_AGENCIES } from "../../page-copy";
import { PageHero } from "../shared/PageHero";
import { PillLink } from "../shared/PillLink";

export function ForAgenciesPage() {
  const { hero, workspaces, call } = FOR_AGENCIES;
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} sub={hero.sub}>
        <div className="mt-10">
          <PillLink href={hero.cta.href} label={hero.cta.label} />
        </div>
      </PageHero>
      {/* the two ways to run client work: the one ink section */}
      <section id="workspaces" className="section-ink scroll-mt-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{workspaces.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{workspaces.title}</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {workspaces.options.map((option) => (
              <article key={option.n} className="flex flex-col rounded-[1.75rem] bg-card p-8 shadow-sm ring-1 ring-border/70 sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="mr-2 text-brand">{option.n}</span>
                  {option.kind}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{option.title}</h3>
                <p className="mt-3 text-muted-foreground">{option.body}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {option.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2.5 text-sm">
                      <Check className="size-4 text-brand" aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link href={option.cta.href} className="mt-8 inline-flex items-center gap-2 font-semibold text-brand hover:underline">
                  {option.cta.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <p className="mt-2 text-xs text-muted-foreground">{option.note}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{FOR_AGENCIES.buildNote}</p>
        </div>
      </section>
      <section className="bg-muted/40 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{call.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{call.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{call.body}</p>
          <Link
            href={call.cta.href}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            {call.cta.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">{call.note}</p>
        </div>
      </section>
    </>
  );
}
