"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { BRAND } from "@/config/brand";
import { MENU_LINKS } from "../../constants";
import styles from "./slide-menu.module.css";

const ARROW = (
  <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

// Under lg the public nav collapses into the spec's slide-in menu
// (docs/reference/glass-card-spec.md §12): blurred backdrop, full-width panel
// that becomes a 380px drawer at ≥640, staggered links, "Get in touch" foot.
// Closes on X / backdrop / link / Escape; focus goes to Close and back to
// the hamburger.
// `trigger` lets the glass nav render the opener as a cell of its mobile row.
export function MobilePublicNav({ trigger }: { trigger?: { className: string; children: ReactNode } }) {
  const [open, setOpen] = useState(false);
  // true after hydration only (portals need document); no setState in an effect.
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const setMenu = useCallback((next: boolean) => {
    setOpen(next);
    // Focus after the state commit so the target is visible/focusable.
    requestAnimationFrame(() => (next ? closeBtn.current : openBtn.current)?.focus({ preventScroll: true }));
  }, []);

  // The sticky header has backdrop-filter, which makes it the containing block
  // for fixed descendants (the menu would be 64px tall). Portal it to <body>.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setMenu]);

  return (
    <>
      <button ref={openBtn} type="button" className={trigger ? trigger.className : "lg:hidden"} aria-label="Open menu" aria-expanded={open} aria-controls={menuId} onClick={() => setMenu(true)}>
        {trigger ? trigger.children : <Menu aria-hidden="true" />}
      </button>
      {mounted ? createPortal(
      <div id={menuId} className={cn(styles.menu, open && styles.open)} aria-hidden={!open}>
        <button type="button" className={styles.backdrop} aria-label="Close menu" tabIndex={-1} onClick={() => setMenu(false)} />
        <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Menu">
          <button ref={closeBtn} type="button" className={styles.close} onClick={() => setMenu(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
            <span>Close</span>
          </button>
          <nav className={styles.nav} aria-label="Main">
            {MENU_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className={styles.link} onClick={() => setMenu(false)}>
                <span className={styles.linkText}>{link.label}</span>
                {ARROW}
              </Link>
            ))}
          </nav>
          <div className={styles.foot}>
            <span className={styles.footLabel}>Get in touch</span>
            <a className={styles.mail} href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
          </div>
        </div>
      </div>,
      document.body,
      ) : null}
    </>
  );
}
