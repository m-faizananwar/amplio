"use client";

import { useLayoutEffect, useRef } from "react";

const GROW_MS = 560;
const FOLD_MS = 380;
// the same spring the window uses to travel between corners (call.css)
const SPRING = "linear(0, 0.2 6%, 0.56 14%, 0.86 23%, 1.02 31%, 1.06 38%, 1.04 46%, 1.01 56%, 0.998 68%, 1)";
const EASE_IN = "cubic-bezier(0.5, 0, 0.75, 0)";

const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const origin = () => document.querySelector<HTMLElement>("[data-call-origin]")?.getBoundingClientRect() ?? null;

// .call-float is fixed at 0,0 and placed by its transform, so a frame that sits
// exactly on another rect is a translate to its corner and a scale to its size.
function onto(rect: DOMRect, el: HTMLElement) {
  return `translate3d(${rect.left}px, ${rect.top}px, 0) scale(${rect.width / el.offsetWidth}, ${rect.height / el.offsetHeight})`;
}

function grow(el: HTMLElement) {
  const from = origin();
  if (!from || still()) return;
  const color = getComputedStyle(el).getPropertyValue("--money");
  // data-growing holds the content back until the frame is big enough (call.css)
  el.dataset.growing = "";
  el.animate(
    [
      { transform: onto(from, el), transformOrigin: "0 0", borderRadius: "50%", backgroundColor: color },
      { transform: el.style.transform, transformOrigin: "0 0", borderRadius: getComputedStyle(el).borderRadius },
    ],
    { duration: GROW_MS, easing: SPRING },
  ).onfinish = () => { delete el.dataset.growing; };
}

// The frame is leaving the DOM, so a still copy of it does the folding. Strict
// mode unmounts and remounts once in dev; then the original is still there a
// frame later and the copy just goes.
function fold(el: HTMLElement) {
  if (still()) return;
  const ghost = el.cloneNode(true) as HTMLElement;
  ghost.inert = true;
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.pointerEvents = "none";
  document.body.append(ghost);
  requestAnimationFrame(() => {
    const to = origin();
    if (el.isConnected || !to) return ghost.remove();
    ghost.firstElementChild?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FOLD_MS / 2, fill: "forwards" });
    ghost.animate(
      [
        { transform: ghost.style.transform, transformOrigin: "0 0", borderRadius: getComputedStyle(ghost).borderRadius },
        { transform: onto(to, ghost), transformOrigin: "0 0", borderRadius: "50%", backgroundColor: getComputedStyle(ghost).getPropertyValue("--money"), opacity: 0.6 },
      ],
      { duration: FOLD_MS, easing: EASE_IN, fill: "forwards" },
    ).onfinish = () => ghost.remove();
  });
}

// The call window grows out of the rail's phone button (marked
// data-call-origin) when it opens, and folds back into it when it goes.
// Without a button to come from (rail folded) it just appears.
export function useCallMorph<T extends HTMLElement>() {
  const node = useRef<T | null>(null);
  useLayoutEffect(() => {
    if (node.current) grow(node.current);
    const frame = node;
    // read at unmount on purpose: the frame may have become the bubble since
    return () => { if (frame.current) fold(frame.current); };
  }, []);
  return node;
}
