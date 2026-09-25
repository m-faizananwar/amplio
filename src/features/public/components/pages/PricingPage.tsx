import { Reveal } from "@/components/motion/Reveal";
import { FAQ } from "../../constants";
import { PRICING_PAGE } from "../../page-copy";
import { GlassCard } from "../glass/GlassCard";
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
      <Reveal>
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <PricingPlans />
          </div>
        </section>
      </Reveal>
      {/* how per-post pricing works: the one ink section, plans above, faq below */}
      <Reveal>
        <section className="section-ink px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{PRICING_PAGE.perPost.title}</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {PRICING_PAGE.perPost.items.map((item, index) => (
                <GlassCard key={item.title} as="li" title={item.title} index={index + 1} order={index} className="p-6">
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </GlassCard>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{PRICING_PAGE.faqTitle}</h2>
            <div className="mt-8">
              <FaqList items={items} />
            </div>
          </div>
        </section>
      </Reveal>
      <CtaSection />
    </>
  );
}
