"use client";

import { Inter_Tight } from "next/font/google";
import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { ChamferLink } from "../glass/ChamferLink";
import { GlassFilterDefs } from "../glass/GlassFilterDefs";
import { HeroGlassCard } from "../glass/HeroGlassCard";
import { HeroRules } from "../glass/HeroRules";
import { HERO_POSTER, PANELS } from "./hero-config";
import styles from "./ScrollHero.module.css";
import { useScrollScrub } from "./useScrollScrub";

// Inter Tight for the hero's display type only; the rest of the page keeps Inter.
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

// The scroll-scrubbed video hero, ported from public/hero/index.html: a 560vh
// track with a sticky one-viewport stage; scrolling the track scrubs the video
// and cross-fades three panels. Preload starts after hydration (the landing
// splash shows its progress; the spec's boot overlay is gone), so the ~11MB
// clip never blocks first paint.
export function ScrollHero() {
  const wrapper = useRef<HTMLElement>(null);
  const clip = useRef<HTMLVideoElement>(null);
  const meter = useRef<HTMLElement>(null);
  const panels = useRef<Array<HTMLElement | null>>([]);
  const status = useScrollScrub({ wrapper, clip, meter, panels });

  return (
    <section ref={wrapper} className={cn(styles.hero, interTight.className, status === "static" && styles.static)} aria-label="Introduction">
      <div className={styles.stage}>
        <GlassFilterDefs />
        <video ref={clip} muted playsInline preload="auto" disablePictureInPicture poster={HERO_POSTER} aria-hidden="true" />
        <div className={styles.veil} />
        <div className={styles.grain} />
        <i ref={meter} className={styles.meter} aria-hidden="true" />

        <div className={styles.panels}>
          {PANELS.map((panel, i) => (
            <section key={panel.h1} ref={(el) => { panels.current[i] = el; }} className={styles.panel} data-panel>
              <p className={styles.eyebrow}>{panel.eyebrow}</p>
              <h1 className={styles.h1}>{panel.h1}</h1>
              <p className={styles.sub}>{panel.sub}</p>
              <div className={styles.cta}>
                {i === 0 ? <ChamferLink href={panel.cta.href} label={panel.cta.label} /> : <Link href={panel.cta.href} className={styles.pill}>{panel.cta.label}</Link>}
              </div>
            </section>
          ))}
        </div>

        <HeroRules />
        <HeroGlassCard videoRef={clip} />

      </div>
    </section>
  );
}
