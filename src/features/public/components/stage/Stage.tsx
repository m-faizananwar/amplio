"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import "./stage.css";

type Props = { children: ReactNode; className?: string; loop?: boolean; label?: string };

// A drawing that plays when it scrolls into view. Until then every animation
// inside (ours in stage.css and the kit's g-draw / g-stamp / g-burst) sits
// paused on its first frame; `loop` drawings pause again off-screen. Under
// reduced motion stage.css shows the final frame and nothing moves.
export function Stage({ children, className, loop = false, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setOn(true);
      else if (loop) setOn(false);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [loop]);
  return (
    <div ref={ref} data-on={on ? "" : undefined} className={cn("stage", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {children}
    </div>
  );
}
