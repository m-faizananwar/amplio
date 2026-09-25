import { FAQ } from "../../constants";
import { FAQ_PAGE, FOR_CREATORS } from "../../page-copy";
import { CtaSection } from "../shared/CtaSection";
import { FaqList } from "../shared/FaqList";
import { PageHero } from "../shared/PageHero";

export function FaqPage() {
  return (
    <>
      <PageHero eyebrow={FAQ_PAGE.hero.eyebrow} title={FAQ_PAGE.hero.title} sub={FAQ_PAGE.hero.sub} />
      {/* the questions are the page: ink, as the landing's faq section is */}
      <section className="section-ink px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{FAQ_PAGE.companies}</h2>
            <div className="mt-6">
              <FaqList items={FAQ.items} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{FAQ_PAGE.creators}</h2>
            <div className="mt-6">
              <FaqList items={FOR_CREATORS.faq.items} />
            </div>
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
