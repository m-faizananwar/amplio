import { getTranslations } from "next-intl/server";
import type { PublicCreator } from "../../../constants";
import { CtaLinks } from "../calm/CtaLinks";
import { PublicHero } from "../calm/PublicHero";

const euros = (cents: number) => `€${Math.round(cents / 100)}`;

// A creator's path, in the order they live it: four ruled steps with the
// trail running down their numbers, then the card brands see (a real demo
// creator, labelled), then how the money moves, then one way in.
export async function ForCreatorsPage({ creator }: { creator: (PublicCreator & { priceCents?: number }) | null }) {
  const t = await getTranslations("public.forCreators");
  const tc = await getTranslations("common");
  const steps = t.raw("steps.items") as { title: string; body: string }[];
  return (
    <>
      <PublicHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} sub={t("hero.sub")}>
        <CtaLinks primary={{ href: "/register/creator", label: t("hero.primary") }} secondary={{ href: "#how", label: t("hero.secondary") }} />
      </PublicHero>
      <section id="how" className="mx-auto max-w-content scroll-mt-20 px-4 py-16 sm:px-8">
        <h2 className="text-h2">{t("steps.title")}</h2>
        <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
          <span aria-hidden="true" className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-rule md:left-0 md:top-[7px] md:h-px md:w-full" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative pl-8 md:pl-0 md:pt-8">
              <span aria-hidden="true" className={`absolute left-0 top-1.5 size-3.5 rounded-full border-2 md:top-0 ${i === steps.length - 1 ? "border-money bg-money" : "border-ink bg-paper"}`} />
              <p className="num text-small text-ink-muted">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-h4">{s.title}</h3>
              <p className="mt-2 text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="border-t border-rule">
        <div className="mx-auto grid max-w-content items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <h2 className="text-h2">{t("card.title")}</h2>
            <p className="mt-3 max-w-md text-ink-muted">{t("card.body")}</p>
            <ul className="mt-6 space-y-2">
              {(t.raw("card.points") as string[]).map((p) => <li key={p} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />{p}</li>)}
            </ul>
          </div>
          {creator ? (
            <figure className="mx-auto w-full max-w-sm rounded-card border border-rule bg-surface p-6 shadow-float">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-ink text-lead font-semibold text-paper" aria-hidden="true">{creator.name.slice(0, 1)}</span>
                <div className="min-w-0">
                  <p className="font-semibold">{creator.name}</p>
                  <p className="truncate text-small text-ink-muted">{creator.headline}</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-rule pt-4">
                <div><dt className="text-caption text-ink-muted">{t("card.followers")}</dt><dd className="num text-h4">{creator.followers.toLocaleString("en-US")}</dd></div>
                {creator.priceCents ? <div><dt className="text-caption text-ink-muted">{t("card.perPost")}</dt><dd className="num text-h4">{euros(creator.priceCents)}</dd></div> : null}
              </dl>
              <p className="mt-4 flex flex-wrap gap-1.5">{creator.industries.slice(0, 3).map((i) => <span key={i} className="rounded-chip border border-rule px-2.5 py-0.5 text-caption">{i}</span>)}</p>
              <figcaption className="mt-4 text-caption text-ink-muted">{tc("demoData")}</figcaption>
            </figure>
          ) : null}
        </div>
      </section>
      <section className="border-t border-rule">
        <div className="mx-auto max-w-content px-4 py-16 sm:px-8">
          <h2 className="text-h2">{t("money.title")}</h2>
          <p className="mt-3 max-w-2xl text-ink-muted">{t("money.body")}</p>
          <p className="mt-4 max-w-2xl text-small text-ink-muted">{t("money.stubNote")}</p>
        </div>
      </section>
      <section className="border-t border-rule bg-ink text-paper">
        <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-20 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-h1 tracking-[-0.03em]">{t("cta.title")}</h2>
            <p className="mt-3 max-w-xl opacity-70">{t("cta.sub")}</p>
          </div>
          <a href="/register/creator" className="inline-flex h-11 items-center rounded-control bg-paper px-5 font-medium text-ink hover:opacity-90">{t("cta.button")}</a>
        </div>
      </section>
    </>
  );
}
