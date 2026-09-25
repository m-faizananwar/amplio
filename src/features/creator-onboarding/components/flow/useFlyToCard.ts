"use client";

import { useEffect, useRef } from "react";

const SETTLE_MS = 450;
const FLIGHT_MS = 520;

// The card assembles itself: when a field's value settles, a copy of it flies
// from the field into its slot on the card (transform + opacity, Web
// Animations), and the slot answers with a small pop. Nothing under reduced
// motion; the card still updates.
export function useFlyToCard(value: string, fromId: string, slot: React.RefObject<HTMLElement | null>) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      const from = document.getElementById(fromId)?.getBoundingClientRect();
      const to = slot.current?.getBoundingClientRect();
      if (!from || !to) return;
      const ghost = document.createElement("span");
      ghost.textContent = value.length > 40 ? `${value.slice(0, 39)}…` : value;
      ghost.className = "pointer-events-none fixed z-50 rounded-chip bg-ink px-2.5 py-1 text-caption text-paper shadow-float";
      ghost.style.left = `${from.left + 12}px`;
      ghost.style.top = `${from.top + from.height / 2 - 12}px`;
      document.body.appendChild(ghost);
      const dx = to.left - from.left - 12;
      const dy = to.top - from.top - from.height / 2 + 12;
      ghost
        .animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 0.2 },
          ],
          { duration: FLIGHT_MS, easing: "cubic-bezier(.2,.8,.2,1)" },
        )
        .finished.finally(() => {
          ghost.remove();
          slot.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out" });
        });
    }, SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [value, fromId, slot]);
}
