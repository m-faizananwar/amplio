"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "cn";
import { measureInto, ACTIVE_ITEM_SELECTOR, NAV_ITEM_SELECTOR } from "@/lib/motion/indicator";

type Props = {
  children: ReactNode;
  /** "y" slides down a rail (sidebar), "x" along a strip (tabs). */
  axis?: "x" | "y";
  variant?: "capsule" | "underline" | "pill";
  /** Pointing at an inactive item previews the move at lower opacity. */
  preview?: boolean;
  className?: string;
};

// One indicator that measures the items themselves and slides to whichever is
// active — the nav's capsule language, reused by the sidebar rail and every tab
// strip. It reads the DOM rather than taking coordinates as props, so a strip
// can wrap, scroll or change its label widths and the indicator still lands.
export function SlidingIndicator({ children, axis = "x", variant = "capsule", preview = true, className }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const place = (target: Element | null, isPreview: boolean) => measureInto(el, target, isPreview);
    const settle = () => place(el.querySelector(ACTIVE_ITEM_SELECTOR), false);

    settle();
    // The first placement must not slide in from the corner.
    const frame = window.requestAnimationFrame(() => { el.dataset.anim = "true"; });

    const mo = new MutationObserver(settle);
    mo.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-current", "aria-selected", "data-active", "data-selected", "class"] });
    const ro = new ResizeObserver(settle);
    ro.observe(el);

    const onOver = (event: PointerEvent) => {
      if (!preview || event.pointerType === "touch") return;
      const item = (event.target as Element | null)?.closest(NAV_ITEM_SELECTOR);
      if (item && el.contains(item)) place(item, !item.matches(ACTIVE_ITEM_SELECTOR));
    };
    const onLeave = () => settle();
    el.addEventListener("pointerover", onOver);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      mo.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerover", onOver);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [preview]);

  return (
    <div ref={root} className={cn("slide-track", className)} data-axis={axis} data-anim="false">
      <span className="slide-ind" data-variant={variant} aria-hidden="true" />
      {children}
    </div>
  );
}
