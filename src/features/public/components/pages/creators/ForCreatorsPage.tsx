import { Reveal } from "@/components/motion/Reveal";
import { cn } from "cn";
import { ShieldCheck } from "lucide-react";
import { FOR_CREATORS } from "../../../page-copy";
import { HERO_POSTER } from "../../hero/hero-config";
import { interTight } from "../../shared/display-font";
import { FaqList } from "../../shared/FaqList";
import { PillLink } from "../../shared/PillLink";
import { SectionHeading } from "../../shared/SectionHeading";
import { CreatorMonetizeSection } from "./CreatorMonetizeSection";
import { CreatorPlatformSection } from "./CreatorPlatformSection";


function Hero() {
  const { hero } = FOR_CREATORS;
  return (
    <section className={cn("page-hero relative -mt-16 overflow-hidden pt-16", interTight.className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.28] blur-[2px]" style={{ backgroundImage: `url(${HERO_POSTER})` }} />
      <div aria-hidden="true" className="page-hero-wash pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-36">
        <h1 className="mt-8 max-w-[15ch] text-[clamp(38px,6.4vw,88px)] font-normal leading-[0.98] tracking-[-0.036em] [text-wrap:balance]">{hero.title}</h1>
        <p className="page-hero-muted mt-6 max-w-2xl text-lg sm:text-xl">
          {hero.sub}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <PillLink href={hero.primary.href} label={hero.primary.label} />
          <PillLink href={hero.secondary.href} label={hero.secondary.label} variant="ghost" />
        </div>
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-foreground/70">
          <ShieldCheck className="size-4" aria-hidden="true" />
          {hero.trust}
        </p>
      </div>
    </section>
  );
}

export function ForCreatorsPage() {
  const { faq, cta } = FOR_CREATORS;
  return (
    <>
      <Hero />
      <CreatorMonetizeSection />
      <CreatorPlatformSection />
      <Reveal>
        {/* the questions carry this page now: the one ink section */}
        <section className="section-ink px-4 sm:px-6">
          <SectionHeading title={faq.title} sub={faq.sub} />
          <div className="mx-auto mt-10 max-w-3xl">
            <FaqList items={faq.items} />
          </div>
        </section>
      </Reveal>
      <section className="page-hero px-4 py-24 text-center sm:px-6">
        <p className="page-hero-eyebrow text-[12.5px] uppercase tracking-[0.18em]">{cta.eyebrow}</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-[-0.03em] sm:text-6xl">{cta.title}</h2>
        <p className="mt-6 text-lg text-foreground/70">{cta.sub}</p>
        <div className="mt-8">
          <PillLink href={cta.button.href} label={cta.button.label} />
        </div>
      </section>
    </>
  );
}
