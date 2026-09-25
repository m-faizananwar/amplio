"use client";

import { type ReactNode, useEffect, useRef } from "react";

// Ambient loops (ripples, typing, the radar sweep) run only while on screen:
// off screen the wrapper is marked and the CSS pauses every animation inside.
export function Loop({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => el.toggleAttribute("data-offscreen", !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <span ref={ref} className="g-loop inline-flex">{children}</span>;
}
