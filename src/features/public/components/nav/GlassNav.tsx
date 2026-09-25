"use client";

import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { BRAND } from "@/config/brand";
import { GLASS_NAV_CELLS } from "../../constants";
import styles from "./glass-nav.module.css";
import { MobilePublicNav } from "./MobilePublicNav";
import { useGlassNav } from "./useGlassNav";

import { HoverBeam } from "@/components/motion/HoverBeam";
// Layout after prisma, material after the LTX controller: the Amplio lockup
// on the left as a plain link, the four-cell glass controller centred (columns
// sized to their labels), Sign in + the Sign up pill on the right. Transparent
// at the top of the page, a frosted 44px bar past 40px of scroll. ≤700 the
// lockup, the hamburger and the slide-in menu; no controller.
export function GlassNav() {
  const controller = useRef<HTMLDivElement>(null);
  const capsule = useRef<HTMLDivElement>(null);
  const nav = useGlassNav({
    controller, capsule, cells: GLASS_NAV_CELLS,
    classes: { collapsed: styles.collapsed, trackFaded: styles.trackFaded, chosen: styles.chosen, faded: styles.faded },
  });
  const busy = nav.phase !== "idle";

  return (
    <header className={cn(styles.header, nav.compressed && styles.compressed, nav.entered && styles.entered)}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={`${BRAND.name} home`}>
          <BrandLockup size="sm" />
        </Link>

        <div
          ref={controller}
          role="navigation"
          aria-label="Main"
          className={cn(styles.controller, nav.phase === "collapsing" && cn(styles.collapsed, styles.trackFaded), nav.phase === "expanding" && styles.expanding)}
          onPointerMove={nav.onPointerMove}
          onPointerLeave={nav.leave}
        >
          <div className={cn(styles.glass, styles.track)} aria-hidden="true" />
          <div ref={capsule} className={cn(styles.glass, styles.capsule)} aria-hidden="true" />
          <div className={styles.cells}>
            {GLASS_NAV_CELLS.map((cell, index) => {
              const chosen = nav.chosen === index;
              return (
                <a
                  key={cell.label}
                  href={cell.href}
                  data-index={index}
                  className={cn(styles.cell, nav.phase === "collapsing" && !chosen && styles.faded, chosen && styles.chosen, nav.phase === "expanding" && styles.restoring)}
                  aria-hidden={busy && !chosen ? true : undefined}
                  tabIndex={busy && !chosen ? -1 : undefined}
                  onPointerEnter={() => nav.hover(index)}
                  onFocus={() => nav.focus(index)}
                  onBlur={() => nav.blur(index)}
                  onClick={(e) => { e.preventDefault(); nav.navigate(index, cell.href); }}
                >
                  {cell.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/login" className={styles.signin}>Sign in</Link>
          <HoverBeam size="line" strength={0.5} className={styles.pillBeam}><Link href="/register" className={styles.pill}>Sign up</Link></HoverBeam>
          <MobilePublicNav />
        </div>
      </div>
    </header>
  );
}
