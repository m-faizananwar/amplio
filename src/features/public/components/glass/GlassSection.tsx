"use client";

import { createContext, type ReactNode, type RefObject, useContext, useRef } from "react";
import { cn } from "@/lib/cn";
import styles from "./glass.module.css";

export const HERO_STILL = "/backdrops/hero-still.jpg";

// The soft static backdrop that card sections give their glass cards to bend:
// the hero still, blurred 18px under a low-opacity paper wash (glass.module.css).
// `refract`: only the first two sections below the hero give their cards the
// static refraction canvas; further down the backdrop is nearly flat, so the
// chrome alone looks the same at rest and costs no filter work.
export const GlassBackdropContext = createContext<{ section: RefObject<HTMLElement | null>; src: string | null } | null>(null);

// A landing section with the backdrop. Cards inside draw it into their
// duplicate canvas once (GlassCard + useStaticGlass); the section itself
// paints the same image behind them.
export function GlassSection({ id, className, refract = false, children }: { id?: string; className?: string; refract?: boolean; children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  return (
    <GlassBackdropContext.Provider value={{ section, src: refract ? HERO_STILL : null }}>
      <section id={id} ref={section} className={cn(styles.backdropSection, className)}>
        <div className={styles.backdropImage} aria-hidden="true" />
        <div className={styles.backdropContent}>{children}</div>
      </section>
    </GlassBackdropContext.Provider>
  );
}

export const useGlassBackdrop = () => useContext(GlassBackdropContext);
