import { Reveal } from "@/components/motion/Reveal";
import type { LegalDoc } from "../../legal-copy";
import { cn } from "@/lib/cn";
import { interTight } from "../shared/display-font";
import { PageHero } from "../shared/PageHero";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} sub={doc.sub} tone="plain" />
      <Reveal>
        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-12">
            {doc.sections.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
                <div className="mt-4 space-y-4 text-foreground/80">
                  {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>
    </>
  );
}
