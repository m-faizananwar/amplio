import { FAQ } from "../../constants";
import { PRICING_PAGE } from "../../page-copy";
import { CtaSection } from "../shared/CtaSection";
import { FaqList } from "../shared/FaqList";
import { PageHero } from "../shared/PageHero";
import { PricingPlans } from "../shared/PricingPlans";

const QUESTIONS = new Set<string>(PRICING_PAGE.faqQuestions);

export function PricingPage() {
  const items = FAQ.items.filter((item) => QUESTIONS.has(item.q));
  return (
    <>
      <PageHero eyebrow={PRICING_PAGE.hero.eyebrow} title={PRICING_PAGE.hero.title} sub={PRICING_PAGE.hero.sub} />
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <PricingPlans />
        </div>
      </section>
      {/* how per-post pricing works: the one ink section, plans above, faq below */}
      <section className="section-ink px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{PRICING_PAGE.perPost.title}</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {PRICING_PAGE.perPost.items.map((item, index) => (
              <li key={item.title} className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/60">
                <span className="text-xs font-bold text-brand">0{index + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{PRICING_PAGE.faqTitle}</h2>
          <div className="mt-8">
            <FaqList items={items} />
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
