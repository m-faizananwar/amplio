import { getTranslations } from "next-intl/server";
import { PublicHero } from "./calm/PublicHero";
import { AmbientTrail } from "../stage/AmbientTrail";

type Section = { id: string; title: string; paragraphs: string[] };
const UPDATED = "2026-09-26";

// A document, not a page: the sections in reading width, and on wide screens
// a sticky index of them on the left so a long notice is easy to move around.
export async function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const t = await getTranslations("public.legal");
  const sections = t.raw(`${doc}.sections`) as Section[];
  return (
    <>
      <PublicHero eyebrow={t("updated", { date: UPDATED })} title={t(`${doc}.title`)} sub={t(`${doc}.sub`)} art={<AmbientTrail className="mx-auto hidden max-w-[16rem] opacity-80 lg:block" />} />
      <div className="mx-auto grid max-w-content gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label={t("onThisPage")} className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-small text-ink-muted">{t("onThisPage")}</p>
            <ul className="mt-3 space-y-2 border-l border-rule">
              {sections.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-3 text-small text-ink-muted hover:border-ink hover:text-ink">{s.title}</a></li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="max-w-2xl space-y-12">
          {sections.map((s) => (
            <article key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-h3">{s.title}</h2>
              <div className="mt-4 space-y-4 text-lead leading-relaxed text-ink-muted">
                {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
