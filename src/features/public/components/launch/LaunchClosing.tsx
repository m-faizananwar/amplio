import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { WordReveal } from "./WordReveal";

const heading = "text-[clamp(40px,6vw,80px)] font-semibold leading-[0.95] tracking-[-0.04em]";

// After the story: how to start, what it costs, questions, sign up. Calmer
// than the scenes, same type scale, one idea per block.
export async function LaunchClosing() {
  const t = await getTranslations("landing");
  const side = (key: "brands" | "creators", href: string) => (
    <div className="rounded-card border border-rule bg-surface p-6 sm:p-8">
      <h3 className="text-h3">{t(`start.${key}.title`)}</h3>
      <ol className="mt-6 space-y-4">
        {(t.raw(`start.${key}.steps`) as string[]).map((step, i) => (
          <li key={step} className="flex gap-4 text-lead">
            <span className="num text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
            {step}
          </li>
        ))}
      </ol>
      <Link href={href} className={cn(buttonVariants({ variant: key === "brands" ? "primary" : "secondary", size: "lg" }), "mt-8")}>
        {t(`start.${key}.cta`)} <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
  const plan = (key: "brands" | "creators") => (
    <div className="rounded-card border border-rule bg-surface p-6 sm:p-8">
      <p className="text-small text-ink-muted">{t(`pricing.${key}.title`)}</p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="num text-h1">{t(`pricing.${key}.price`)}</span>
        <span className="text-ink-muted">{t(`pricing.${key}.unit`)}</span>
      </p>
      <ul className="mt-6 space-y-3">
        {(t.raw(`pricing.${key}.points`) as string[]).map((point) => (
          <li key={point} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-money" aria-hidden="true" />{point}</li>
        ))}
      </ul>
    </div>
  );
  const items = t.raw("faq.items") as { q: string; a: string }[];
  return (
    <>
      <section id="start" className="mx-auto max-w-content scroll-mt-20 px-4 py-24 sm:px-8">
        <WordReveal as="h2" text={t("start.title")} className={heading} />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">{side("brands", "/register/brand")}{side("creators", "/register/creator")}</div>
      </section>
      <section id="pricing" className="border-t border-rule">
        <div className="mx-auto max-w-content scroll-mt-20 px-4 py-24 sm:px-8">
          <WordReveal as="h2" text={t("pricing.title")} className={heading} />
          <p className="mt-6 max-w-xl text-lead text-ink-muted">{t("pricing.sub")}</p>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">{plan("brands")}{plan("creators")}</div>
          <p className="mt-6 text-small text-ink-muted">{t("pricing.stubNote")}</p>
        </div>
      </section>
      <section id="faq" className="border-t border-rule">
        <div className="mx-auto grid max-w-content scroll-mt-20 gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <WordReveal as="h2" text={t("faq.title")} className={heading} />
          <div className="divide-y divide-rule border-y border-rule">
            {items.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lead font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-h4 text-ink-muted transition-transform duration-(--duration-fast) ease-ledger group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-rule bg-ink text-paper">
        <div className="mx-auto max-w-content px-4 py-28 sm:px-8">
          <WordReveal as="h2" text={t("signup.title")} className="text-[clamp(48px,8vw,112px)] font-semibold leading-[0.92] tracking-[-0.045em]" />
          <p className="mt-6 max-w-xl text-lead opacity-70">{t("signup.sub")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/register/brand" className="inline-flex h-12 items-center gap-2 rounded-control bg-paper px-6 text-lead font-medium text-ink transition-opacity duration-(--duration-fast) hover:opacity-90">{t("signup.primary")} <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/register/creator" className="inline-flex h-12 items-center rounded-control border border-paper/40 px-6 text-lead font-medium transition-colors duration-(--duration-fast) hover:bg-paper/10">{t("signup.secondary")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
