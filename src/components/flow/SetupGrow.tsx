"use client";

import { useEffect } from "react";

const GROW_MS = 450;
const SPRING = "cubic-bezier(.34, 1.4, .64, 1)";

// The open step grows out of its tab: its header starts at the tab's size and
// the fields unroll under it on the spring (clip-path from the header down).
// Runs when a step opens; nothing under reduced motion.
export function SetupGrow({ stepKey }: { stepKey: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const head = document.querySelector<HTMLElement>("[data-setup-current]");
    const fields = head?.parentElement?.querySelector<HTMLElement>(":scope > [data-area='fields']");
    head?.animate([{ transform: "scale(.96)", opacity: 0.6 }, { transform: "none", opacity: 1 }], { duration: GROW_MS, easing: SPRING });
    fields?.animate(
      [{ clipPath: "inset(0 0 100% 0 round 0 0 20px 20px)", opacity: 0 }, { clipPath: "inset(0 0 0 0 round 0 0 20px 20px)", opacity: 1 }],
      { duration: GROW_MS, easing: SPRING },
    );
  }, [stepKey]);
  return null;
}
