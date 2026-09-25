"use client";

import { cn } from "@/lib/cn";
import type React from "react";
import { type ReactNode, useLayoutEffect, useRef } from "react";
import { registerMorph } from "@/lib/motion/scroll-morph";

type Props = { children: ReactNode; className?: string; as?: "div" | "section" | "li" };

// A landing section or a dashboard block. Its tiles (direct children, or the
// items of a single wrapped grid) get [data-morph] and pop in on blovio's
// spring, 80ms apart, when the section scrolls into view; headings among
// them get textReveal instead. Nothing is hidden until html.pop-ready.
export function Reveal({ children, className, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const only = node.children.length === 1 ? (node.children[0] as HTMLElement) : null;
    const tiles = Array.from(node.children.length > 1 ? node.children : only && only.children.length > 1 ? only.children : [node]) as HTMLElement[];
    for (const t of tiles) t.setAttribute("data-morph", /^H[1-3]$/.test(t.tagName) ? "text" : "");
    // the section's own heading gets textReveal (skew + blur) on top of its tile's pop
    const heading = node.querySelector<HTMLElement>("h1, h2");
    if (heading && !tiles.includes(heading)) { heading.setAttribute("data-morph", "text"); tiles.push(heading); }
    return registerMorph(tiles);
  }, []);
  const classes = cn(className);
  if (as === "section") return <section ref={ref as React.RefObject<HTMLElement | null>} data-morph-group className={classes}>{children}</section>;
  if (as === "li") return <li ref={ref as React.RefObject<HTMLLIElement | null>} data-morph-group className={classes}>{children}</li>;
  return <div ref={ref} data-morph-group className={classes}>{children}</div>;
}
