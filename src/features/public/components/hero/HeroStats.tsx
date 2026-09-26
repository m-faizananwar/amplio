import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";
import s from "./hero.module.css";
import { statLayout } from "./stat-layout";

type Stat = { value: number; text: string } | null;

const at = (x: number, y: number, sx?: number) => ({ "--x": x, "--y": y, ...(sx ? { "--sx": sx } : {}) }) as CSSProperties;

// The two numbers that matter, real and from the demo workspace: clicks traced
// to a post, sign-ups attributed. `data-value` is what the entrance counts to.
export async function HeroStats({ clicks, signups, locale }: { clicks: Stat; signups: Stat; locale: string }) {
  const t = await getTranslations("landing.glass");
  const one = clicks?.text ?? "—";
  const two = signups?.text ?? "—";
  const x = statLayout(one, two);
  const br = { br: () => <br /> };
  return (
    <div className={s.stats}>
      <div className={s.stat}>
        <p className={cn(s.num, s.l, s.b, s.sx)} style={at(x.num1, 60.4, 1)} data-hx="num1" data-value={clicks?.value} data-locale={locale}>{one}</p>
        <p className={cn(s.lbl, s.l, s.b, s.sx)} style={at(x.lbl1, 73.2, 0.9634)} data-hx="lbl1">{t.rich("statClicks", br)}</p>
      </div>
      <span className={cn(s.slash, s.l, s.b)} style={at(x.slash, 76)} data-hx="slash" aria-hidden="true" />
      <div className={s.stat}>
        <p className={cn(s.num, s.l, s.b, s.sx)} style={at(x.num2, 60.4, 0.9858)} data-hx="num2" data-value={signups?.value} data-locale={locale}>{two}</p>
        <p className={cn(s.lbl, s.l, s.b, s.sx)} style={at(x.lbl2, 96.7, 0.9209)} data-hx="lbl2">{t.rich("statSignups", br)}</p>
      </div>
    </div>
  );
}
