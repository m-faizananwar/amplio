"use client";

import { type CSSProperties, type ReactNode, useRef } from "react";
import { cn } from "@/lib/cn";
import styles from "./glass.module.css";
import { useGlassBackdrop } from "./GlassSection";
import { useStaticGlass } from "./useStaticGlass";

type Props = {
  title: ReactNode;
  index: number; // 1-based; rendered as //0N
  order?: number; // position in its section, for the 60ms entrance stagger
  as?: "article" | "li" | "div";
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

// The hero card's chrome for every landing card: 48px radius, the 1px border,
// the frost layer, transparent background, head row (title in Helvetica Neue
// Light + //0N index) over a hairline, hover frost .05 → .10, fade-slide-up
// entrance staggered 60ms per card. Inside a GlassSection the card also bends
// the section backdrop through the same filter (static, drawn once).
export function GlassCard({ title, index, order = 0, as: Tag = "article", className, bodyClassName, children }: Props) {
  const backdrop = useGlassBackdrop();
  const card = useRef<HTMLElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useStaticGlass({ section: backdrop?.section ?? { current: null }, card, container, canvas }, backdrop?.src ?? null);

  return (
    <Tag ref={card as never} className={cn(styles.chrome, "card-invert", className)} style={{ "--card-i": order } as CSSProperties}>
      {backdrop?.src ? <div ref={container} className={cn(styles.dup, styles.dupStatic)}><canvas ref={canvas} className={styles.dupImage} /></div> : null}
      <div className={styles.frost} aria-hidden="true" />
      <div className={cn(styles.head, styles.glassFont)}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.index}>{`//${String(index).padStart(2, "0")}`}</span>
      </div>
      <div className={cn(styles.chromeBody, bodyClassName)}>{children}</div>
    </Tag>
  );
}
