import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CTA } from "../../constants";
import { GlassCard } from "../glass/GlassCard";
import { GlassSection } from "../glass/GlassSection";
import { PillLink } from "./PillLink";

export function CtaSection() {
  return (
    <GlassSection id="cta" className="scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{CTA.eyebrow}</p>
        <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] sm:text-6xl">{CTA.title}</h2>
        <p className="mt-6 text-lg text-muted-foreground">{CTA.sub}</p>
        <GlassCard title={CTA.cardTitle} index={1} className="mx-auto mt-12 max-w-lg p-8 text-left sm:p-10">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {CTA.cardEyebrow}
          </p>
          <p className="mt-4 text-muted-foreground">{CTA.cardBody}</p>
          <ul className="mt-6 divide-y divide-foreground/10 border-y border-foreground/10">
            {CTA.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-3 py-3.5">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                {bullet}
              </li>
            ))}
          </ul>
          <PillLink href={CTA.button.href} label={CTA.button.label} className="mt-8 w-full" />
          <p className="mt-3 text-center text-sm text-muted-foreground">{CTA.buttonNote}</p>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {CTA.alt.text}{" "}
            <Link href={CTA.alt.href} className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline">
              {CTA.alt.label}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </p>
        </GlassCard>
        <p className="mt-10 text-sm text-muted-foreground">{CTA.footnote}</p>
      </div>
    </GlassSection>
  );
}
