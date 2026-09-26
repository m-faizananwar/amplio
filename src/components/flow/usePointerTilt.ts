"use client";

import { type RefObject, useEffect } from "react";

const TILT_X_DEG = 6;
const TILT_Y_DEG = 8;

// Tilts an element gently toward the pointer (writes --rx / --ry; the CSS owns
// the easing). Fine pointers only, never under reduced motion.
export function usePointerTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const allowed = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!allowed.matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-y * TILT_X_DEG).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * TILT_Y_DEG).toFixed(2)}deg`);
    };
    const leave = () => { el.style.removeProperty("--rx"); el.style.removeProperty("--ry"); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [ref]);
}
