import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { HERO_POSTER } from "../hero/hero-config";
import { interTight } from "./display-font";

type Props = { eyebrow?: string; title: string; sub?: string; children?: ReactNode; tone?: "sky" | "plain" | "navy"; align?: "center" | "left" };

// Hero band for the static public pages, in the landing's language: paper
// background with the hero still at low opacity behind it (no colour wash),
// the hero's Inter Tight display type, the tracked-caps eyebrow. `tone` is
// kept for the callers; every tone now paints the same paper.
export function PageHero({ eyebrow, title, sub, children, tone = "sky", align = "center" }: Props) {
  const navy = tone === "navy";
  return (
    <section className={cn("page-hero relative -mt-16 overflow-hidden pt-16", interTight.className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.28] blur-[2px]" style={{ backgroundImage: `url(${HERO_POSTER})` }} />
      <div aria-hidden="true" className="page-hero-wash pointer-events-none absolute inset-0" />
      <div className={cn("relative mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28", align === "center" ? "flex flex-col items-center text-center" : "", navy ? "pt-16 sm:pt-20" : "")}>
        {eyebrow ? <p className="page-hero-eyebrow text-[12.5px] uppercase tracking-[0.18em]">{eyebrow}</p> : null}
        <h1 className="mt-4 max-w-[15ch] text-[clamp(38px,6.4vw,88px)] font-normal leading-[0.98] tracking-[-0.036em] [text-wrap:balance]">{title}</h1>
        {sub ? <p className="page-hero-muted mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl [text-wrap:pretty]">{sub}</p> : null}
        {children}
      </div>
    </section>
  );
}
