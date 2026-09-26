"use client";

import { type RefObject, useCallback } from "react";

const DURATION_MS = 500;
const SPRING = "cubic-bezier(.34, 1.56, .64, 1)";
const FOLD = "cubic-bezier(.4, 0, .2, 1)";
const CARD_RADIUS_PX = 20;
const FOLD_MS = 300;
const SLACK_MS = 80;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The panel grows out of the element it was opened from (its box expands
// into the centred panel on the spring) and folds back into it on close.
// Transform and opacity only; reduced motion skips the travel.
export function useGrowFrom(panel: RefObject<HTMLElement | null>) {
  const frames = (origin: HTMLElement) => {
    const el = panel.current;
    if (!el) return null;
    const from = origin.getBoundingClientRect();
    const to = el.getBoundingClientRect();
    const sx = from.width / to.width;
    const sy = from.height / to.height;
    const small = { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`, borderRadius: `${CARD_RADIUS_PX / sx}px / ${CARD_RADIUS_PX / sy}px`, opacity: 0.4 };
    return { small, full: { transform: "none", borderRadius: "24px", opacity: 1 } };
  };
  const grow = useCallback((origin: HTMLElement | null) => {
    const f = origin && !reduced() ? frames(origin) : null;
    if (f) panel.current?.animate([f.small, f.full], { duration: DURATION_MS, easing: SPRING });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- frames reads the ref at call time
  }, [panel]);
  const fold = useCallback(async (origin: HTMLElement | null) => {
    const f = origin && !reduced() ? frames(origin) : null;
    if (!f || !panel.current) return;
    const fold = panel.current.animate([f.full, f.small], { duration: FOLD_MS, easing: FOLD, fill: "forwards" });
    // never wait on the animation alone: a paused or cancelled one must not keep the dialog open
    await Promise.race([fold.finished.catch(() => undefined), new Promise((r) => window.setTimeout(r, FOLD_MS + SLACK_MS))]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- frames reads the ref at call time
  }, [panel]);
  return { grow, fold };
}
