"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useLayoutEffect, useRef } from "react";
import { registerMorph } from "@/lib/motion/scroll-morph";

// Route-enter motion for the app shells (mounted from template.tsx, so it
// remounts on every client navigation): the page's direct children — tiles,
// cards, tables as whole blocks — rise 8px, 20ms apart, one shot per visit.
// A page header whose title lands word by word (WordReveal) animates itself.
// The page streams in, so the children are (re)marked whenever they change.
// Opacity + transform only, so nothing shifts; reduced motion is instant.
export function RouteEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    let release: () => void = () => undefined;
    const mark = () => {
      release();
      const targets: HTMLElement[] = [];
      Array.from(root.children).forEach((child, i) => {
        const el = child as HTMLElement;
        if (el.hasAttribute("data-morph-group") || el.hasAttribute("data-morph") || el.getAttribute("aria-busy") === "true") return;
        // a page header whose title lands word by word animates itself
        if (i === 0 && el.querySelector("[data-word-reveal]")) return;
        el.setAttribute("data-morph", "");
        targets.push(el);
      });
      const unregister = registerMorph(targets);
      // drop our marks too, or a re-run (Strict Mode's double effect, a
      // streamed swap) would read them as someone else's and skip the tiles
      release = () => { unregister(); targets.forEach((el) => el.removeAttribute("data-morph")); };
    };
    mark();
    // the streamed page replaces the skeleton after mount
    const mo = new MutationObserver(() => mark());
    mo.observe(root, { childList: true });
    return () => { mo.disconnect(); release(); };
  }, [pathname]);
  return <div ref={ref} data-morph-group>{children}</div>;
}
