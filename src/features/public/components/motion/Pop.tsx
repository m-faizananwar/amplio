"use client";

import { type ElementType, type ReactNode, useRef } from "react";
import { cn } from "@/lib/cn";
import { useInView } from "../launch/useInView";

type Props = { children: ReactNode; className?: string; as?: ElementType; id?: string };

// A section below the hero: its children pop in on the spring, 80ms apart,
// when it scrolls into view, and again whenever it comes back (up or down).
// A child marked .pop-deep hands the pop to its own children (a grid of
// cards pops card by card); a WordReveal heading keeps its word-by-word rise.
export function Pop({ children, className, as: Tag = "div", id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { amount: 0.12, repeat: true });
  return (
    <Tag ref={ref} id={id} className={cn("pop", className)} data-on={on ? "" : undefined}>
      {children}
    </Tag>
  );
}
