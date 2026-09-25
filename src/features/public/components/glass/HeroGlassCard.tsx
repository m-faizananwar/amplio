"use client";

import { type RefObject, useRef } from "react";
import { cn } from "@/lib/cn";
import { GLASS_CARD, WAVE_PATH } from "./glass-copy";
import styles from "./glass.module.css";
import { useSplashGate } from "../splash/useSplashGate";
import { useGlassSync } from "./useGlassSync";

import { Beam } from "@/components/motion/Beam";
// The liquid-glass card over the scroll hero: a window onto a refracted copy
// of the hero's own video (a blob src, so the canvas is not even tainted).
// Three layers: refracted duplicate (0), frost sheen (1), text and wave (2).
export function HeroGlassCard({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) {
  const card = useRef<HTMLElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useGlassSync({ video: videoRef, card, container, canvas });
  const entered = useSplashGate();

  return (
    <aside ref={card} className={cn(styles.card, styles.glassFont, !entered && styles.waiting)} aria-label={GLASS_CARD.title}>
      <div ref={container} className={styles.dup}><canvas ref={canvas} className={styles.dupImage} /></div>
      <div className={styles.frost} aria-hidden="true" />
      {/* a low colourful beam rides the card's bottom edge at rest */}
      <Beam size="line" strength={0.3} className={styles.beam} aria-hidden="true"><span className={styles.beamBox} /></Beam>
      <div className={styles.head}>
        <h2 className={styles.title}>{GLASS_CARD.title}</h2>
        <span className={styles.index}>{GLASS_CARD.index}</span>
      </div>
      <div className={styles.body}>
        {GLASS_CARD.findings.map((f) => (
          <div key={f.title}>
            <h3 className={styles.findingTitle}>{f.title}</h3>
            <p className={styles.findingText}>{f.text}</p>
          </div>
        ))}
      </div>
      <svg className={styles.wave} viewBox="0 0 220 50" fill="none" aria-hidden="true">
        <path d={WAVE_PATH} stroke="black" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </aside>
  );
}
