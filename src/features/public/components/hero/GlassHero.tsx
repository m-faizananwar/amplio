import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/money";
import type { PublicTrail } from "../../constants";
import { GlassIcon } from "../nav/GlassIcon";
import { DemoPill } from "./DemoPill";
import { TIMELINE_SCRIPT } from "./entrance-script";
import { HeroPanel } from "./HeroPanel";
import { HeroPlate } from "./plate/HeroPlate";
import { HeroStats } from "./HeroStats";
import f from "./frame.module.css";
import s from "./hero.module.css";
import { inter } from "./inter";

const PCT = 100;

const at = (x: number, y: number, sx?: number) => ({ "--x": x, "--y": y, ...(sx ? { "--sx": sx } : {}) }) as CSSProperties;

// The landing's first screen (docs/design/PAGES.md, "Glass hero"): a pale
// glass plate, one line in two parts, the demo workspace's live counts in a
// glass panel and a stats row, and the way into the demo. The header above it
// is the public nav (PublicHeader); the story scenes follow below (#story).
export async function GlassHero({ trail }: { trail: PublicTrail | null }) {
  const [t, locale] = await Promise.all([getTranslations("landing.glass"), getLocale()]);
  const fmt = (n: number) => formatCount(n, locale);
  const figures = trail ? { posts: fmt(trail.posts), links: fmt(trail.links), clicks: fmt(trail.clicks), signups: fmt(trail.signups) } : null;
  const rate = trail && trail.clicks > 0 ? (trail.signups / trail.clicks) * PCT : null;
  return (
    <section className={cn(f.frame, inter.variable, s.hero)} aria-labelledby="hero-title">
      <div className={s.card}>
        <HeroPlate />
        <div className={s.stack}>
          <div className={cn(s.row, s.spacer)} aria-hidden="true" />
          <div className={s.heroBlk}>
            <p className={cn(s.eyebrow, s.l, s.c, s.sx)} style={at(65.7, -209.2, 0.9293)} data-hx="eyebrow">{t("eyebrow")}</p>
            <h1 id="hero-title" className={cn(s.h1, s.l, s.c)} style={at(62.6, -167.3)}>
              <span className={s.sx} style={{ "--sx": 0.9431 } as CSSProperties} data-hx="line1">{t("line1")}</span>
              <br />
              <span className={s.sx} style={{ "--sx": 0.9792 } as CSSProperties} data-hx="line2">{t("line2")}</span>
            </h1>
            <div className={s.tagrow}>
              <a href="#story" className={cn(s.play, s.l, s.c)} style={at(66, 34)} aria-label={t("play")} data-hx="play">
                <GlassIcon name="play" />
              </a>
              <span className={cn(s.tag, s.l, s.c, s.sx)} style={at(131, 48.7, 0.8973)} data-hx="tag">{t("tag")}</span>
            </div>
            <HeroPanel figures={figures} rate={rate} />
          </div>
          <div className={cn(s.row, s.lastRow)}>
            <HeroStats
              clicks={trail ? { value: trail.clicks, text: fmt(trail.clicks) } : null}
              signups={trail ? { value: trail.signups, text: fmt(trail.signups) } : null}
              locale={locale}
            />
            <DemoPill label={t("demo")} />
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: TIMELINE_SCRIPT }} />
    </section>
  );
}
