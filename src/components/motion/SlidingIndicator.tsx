"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "cn";
import { trackIndicator } from "@/lib/motion/indicator";

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

  useEffect(() => (root.current ? trackIndicator(root.current, preview) : undefined), [preview]);

  return (
    <div ref={root} className={cn("slide-track", className)} data-axis={axis} data-anim="false">
      <span className="slide-ind" data-variant={variant} aria-hidden="true" />
      {children}
    </div>
  );
}
