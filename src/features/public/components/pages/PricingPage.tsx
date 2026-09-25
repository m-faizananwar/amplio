import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { PublicTrail } from "../../constants";
import { CtaLinks } from "./calm/CtaLinks";
import { PublicHero } from "./calm/PublicHero";
import { CoinSplit } from "../stage/CoinSplit";
import { Stage } from "../stage/Stage";

const euros = (cents: number) => `€${Math.round(cents / 100).toLocaleString("en-US")}`;

// Two plans side by side (that's all there is), then a worked example from
// the demo workspace's real numbers, then what you never pay for.
export async function PricingPage({ trail }: { trail: PublicTrail | null }) {
  const t = await getTranslations("public.pricing");
  const plan = (key: "brands" | "creators", href: string) => (
    <div className="flex flex-col rounded-card border border-rule bg-surface p-6 sm:p-8">
      <p className="text-small text-ink-muted">{t(`${key}.title`)}</p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-h1 tracking-[-0.03em]">{t(`${key}.price`)}</span>
        <span className="text-ink-muted">{t(`${key}.unit`)}</span>
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {(t.raw(`${key}.points`) as string[]).map((p) => (
          <li key={p} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-money" aria-hidden="true" />{p}</li>
        ))}
      </ul>
      <div className="mt-8 flex"><CtaLinks primary={{ href, label: t(`${key}.cta`) }} /></div>
    </div>
  );
  return (
    <>
      <PublicHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        sub={t("hero.sub")}
        art={<Stage><CoinSplit price={trail?.example ? euros(trail.example.feeCents) : "€"} labels={{ brand: t("coin.brand"), creator: t("coin.creator"), fee: t("coin.fee") }} /></Stage>}
      />
      <section className="mx-auto grid max-w-content gap-4 px-4 py-16 sm:px-8 lg:grid-cols-2">
        {plan("brands", "/register/brand")}
        {plan("creators", "/register/creator")}
      </section>
      {trail?.example ? (
        <section className="border-t border-rule">
          <div className="mx-auto grid max-w-content gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-h2">{t("example.title")}</h2>
              <p className="mt-3 max-w-md text-ink-muted">{t("example.body")}</p>
            </div>
            <div>
              <dl className="divide-y divide-rule rounded-card border border-rule bg-surface">
                <div className="flex items-center justify-between gap-4 px-5 py-4"><dt>{t("example.rowPost", { price: euros(trail.example.feeCents) })}</dt><dd className="num text-h4">{euros(trail.example.feeCents)}</dd></div>
                <div className="flex items-center justify-between gap-4 px-5 py-4"><dt>{t("example.rowClicks", { clicks: trail.example.clicks })}</dt><dd className="num text-h4">{trail.example.clicks.toLocaleString("en-US")}</dd></div>
                <div className="flex items-center justify-between gap-4 px-5 py-4"><dt>{t("example.rowSignups", { signups: trail.example.signups })}</dt><dd className="num text-h4 text-money">{trail.example.signups}</dd></div>
              </dl>
              <p className="mt-3 text-small text-ink-muted">{t("example.note")}</p>
            </div>
          </div>
        </section>
      ) : null}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-content px-4 py-16 sm:px-8">
          <h2 className="text-h2">{t("never.title")}</h2>
          <Stage>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(t.raw("never.items") as string[]).map((item, i) => (
              <li key={item} className="flex items-center gap-3 rounded-card border border-rule px-4 py-3">
                <X className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="relative">
                  {item}
                  <svg className="pointer-events-none absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 overflow-visible" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 5 C 30 2, 60 7, 100 3" pathLength={1} className="st-draw" stroke="var(--color-failure)" strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke" style={{ ["--d" as string]: `${300 + i * 220}ms` }} />
                  </svg>
                </span>
              </li>
            ))}
          </ul>
          </Stage>
          <p className="mt-8 text-small text-ink-muted">{t("stubNote")}</p>
        </div>
      </section>
    </>
  );
}
