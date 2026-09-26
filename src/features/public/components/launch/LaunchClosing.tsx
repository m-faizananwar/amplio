import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { formatWholeEuros } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { PublicTrail } from "../../constants";
import { CoinSplit } from "../stage/CoinSplit";
import { FaqGlyph } from "../stage/FaqGlyph";
import { Pop } from "../motion/Pop";
import { Stage } from "../stage/Stage";
import { WordReveal } from "./WordReveal";

const heading = "text-[clamp(40px,6vw,80px)] font-semibold leading-[0.95] tracking-[-0.04em]";
const words = { stepMs: 80, repeat: true };

// After the story: how to start, what it costs, questions, sign up. Calmer
// than the scenes, same type scale, one idea per block; each block pops in
// (Pop) and its cards lift and invert on hover.
export async function LaunchClosing({ trail }: { trail: PublicTrail | null }) {
  const locale = await getLocale();
  const coinPrice = trail?.example ? formatWholeEuros(trail.example.feeCents, locale) : "€";
  const t = await getTranslations("landing");
  const side = (key: "brands" | "creators", href: string) => (
    <div className="card-invert rounded-card border border-rule bg-surface p-6 sm:p-8">
      <h3 className="text-h3">{t(`start.${key}.title`)}</h3>
      <ol className="mt-6 space-y-4">
        {(t.raw(`start.${key}.steps`) as string[]).map((step, i) => (
          <li key={step} className="flex gap-4 text-lead">
            <span className="num text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
            {step}
          </li>
        ))}
      </ol>
      <Link href={href} className={cn(buttonVariants({ variant: key === "brands" ? "solid" : "line", size: "lg" }), "mt-8")}>
        {t(`start.${key}.cta`)} <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
  const plan = (key: "brands" | "creators") => (
    <div className="card-invert rounded-card border border-rule bg-surface p-6 sm:p-8">
      <p className="text-small text-ink-muted">{t(`pricing.${key}.title`)}</p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className={cn("text-h1 tracking-[-0.03em]", /\d/.test(t(`pricing.${key}.price`)) && "num")}>{t(`pricing.${key}.price`)}</span>
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
      <section id="start" className="scroll-mt-20">
        <Pop className="mx-auto max-w-content px-4 py-24 sm:px-8">
          <WordReveal as="h2" text={t("start.title")} className={heading} {...words} />
          <div className="pop-deep mt-12 grid gap-4 lg:grid-cols-2">{side("brands", "/register/brand")}{side("creators", "/register/creator")}</div>
        </Pop>
      </section>
      <section id="pricing" className="border-t border-rule">
        <Pop className="mx-auto max-w-content scroll-mt-20 px-4 py-24 sm:px-8">
          <WordReveal as="h2" text={t("pricing.title")} className={heading} {...words} />
          <p className="mt-6 max-w-xl text-lead text-ink-muted">{t("pricing.sub")}</p>
          <Stage className="mt-10 max-w-xl"><CoinSplit price={coinPrice} labels={{ brand: t("pricing.coin.brand"), creator: t("pricing.coin.creator"), fee: t("pricing.coin.fee") }} /></Stage>
          <div className="pop-deep mt-12 grid gap-4 lg:grid-cols-2">{plan("brands")}{plan("creators")}</div>
          <p className="mt-6 text-small text-ink-muted">{t("pricing.stubNote")}</p>
        </Pop>
      </section>
      <section id="faq" className="border-t border-rule">
        <Pop className="mx-auto grid max-w-content scroll-mt-20 gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <WordReveal as="h2" text={t("faq.title")} className={heading} {...words} />
          <div className="pop-deep divide-y divide-rule border-y border-rule">
            {items.map((item, index) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lead font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-h4 text-ink-muted transition-transform duration-(--duration-fast) ease-ledger group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <div className="mt-3 flex max-w-2xl gap-4"><FaqGlyph index={index} /><p className="text-ink-muted">{item.a}</p></div>
              </details>
            ))}
          </div>
        </Pop>
      </section>
      <section className="border-t border-rule bg-ink text-paper">
        <Pop className="mx-auto max-w-content px-4 py-28 sm:px-8">
          <WordReveal as="h2" text={t("signup.title")} className="text-[clamp(48px,8vw,112px)] font-semibold leading-[0.92] tracking-[-0.045em]" {...words} />
          <p className="mt-6 max-w-xl text-lead opacity-70">{t("signup.sub")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/register/brand" className="inline-flex h-12 items-center gap-2 rounded-control bg-paper px-6 text-lead font-medium text-ink transition-opacity duration-(--duration-fast) hover:opacity-90">{t("signup.primary")} <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/register/creator" className="inline-flex h-12 items-center rounded-control border border-paper/40 px-6 text-lead font-medium transition-colors duration-(--duration-fast) hover:bg-paper/10">{t("signup.secondary")}</Link>
          </div>
        </Pop>
      </section>
    </>
  );
}
