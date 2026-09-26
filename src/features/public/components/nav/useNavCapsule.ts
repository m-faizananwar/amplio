"use client";

import { type RefObject, useEffect, useRef } from "react";

function place(cap: HTMLElement | null, nav: HTMLElement | null, index: number) {
  const item = nav?.querySelectorAll<HTMLElement>("[data-cap]")[index];
  if (!cap) return;
  if (!item) { cap.removeAttribute("data-on"); return; }
  cap.style.setProperty("--cap-x", `${item.offsetLeft}px`);
  cap.style.setProperty("--cap-w", `${item.offsetWidth}px`);
  cap.setAttribute("data-on", "");
}

// The nav's capsule: parked behind the current page's item, it follows the
// pointer (or focus) to any other item and springs back on leave. The box is
// measured from the items and written as custom properties; the CSS owns the
// spring. With no current item (the landing) it fades out on leave.
export function useNavCapsule(nav: RefObject<HTMLElement | null>, current: number) {
  const capsule = useRef<HTMLSpanElement>(null);
  const moveTo = (index: number) => place(capsule.current, nav.current, index);
  const park = () => place(capsule.current, nav.current, current);

  // Parked without a slide on arrival; the spring only runs once it has a place to start from.
  useEffect(() => {
    const el = nav.current;
    place(capsule.current, el, current);
    const raf = requestAnimationFrame(() => capsule.current?.setAttribute("data-anim", ""));
    // late fonts and the 500ms compress both change the items' boxes
    const ro = el ? new ResizeObserver(() => { if (!el.matches(":hover")) place(capsule.current, el, current); }) : null;
    if (el) ro?.observe(el);
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); };
  }, [nav, current]);

  return { capsule, moveTo, park };
}
