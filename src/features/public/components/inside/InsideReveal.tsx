"use client";

import { type ReactNode, useRef } from "react";
import { useInView } from "../launch/useInView";
import s from "./inside.module.css";

// Marks the section once it enters the viewport; the CSS plays the entrance.
export function InsideReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { amount: 0.2 });
  return <section ref={ref} className={`${s.reveal} ${className ?? ""}`} data-on={on ? "" : undefined}>{children}</section>;
}
