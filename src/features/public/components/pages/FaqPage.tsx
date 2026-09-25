import { getTranslations } from "next-intl/server";
import { CtaLinks } from "./calm/CtaLinks";
import { FaqTabs } from "./calm/FaqTabs";
import { PublicHero } from "./calm/PublicHero";

type Item = { q: string; a: string };

// Two audiences, one question at a time: brands and creators ask different
// things, so the list is split by a tab rather than interleaved.
export async function FaqPage() {
  const t = await getTranslations("public.faq");
  return (
    <>
      <PublicHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} sub={t("hero.sub")} />
      <section className="mx-auto max-w-content px-4 py-16 sm:px-8">
        <FaqTabs
          brands={{ label: t("brands.title"), items: t.raw("brands.items") as Item[] }}
          creators={{ label: t("creators.title"), items: t.raw("creators.items") as Item[] }}
        />
      </section>
      <section className="border-t border-rule">
        <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-16 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-h2">{t("more.title")}</h2>
            <p className="mt-3 max-w-xl text-ink-muted">{t("more.body")}</p>
          </div>
          <div className="flex gap-3"><CtaLinks primary={{ href: "/register", label: t("more.button") }} /></div>
        </div>
      </section>
    </>
  );
}
