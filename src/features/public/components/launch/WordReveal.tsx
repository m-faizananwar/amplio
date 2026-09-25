"use client";

import { type ElementType, Fragment, useRef } from "react";
import { cn } from "@/lib/cn";
import { useInView } from "./useInView";

type Props = { text: string; as?: ElementType; className?: string; delayMs?: number; stepMs?: number };

// Text that lands word by word: each word rises from under its own line box,
// `stepMs` apart. Screen readers get the sentence once.
export function WordReveal({ text, as: Tag = "p", className, delayMs = 0, stepMs = 45 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { amount: 0.15 });
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={cn("launch-words", on && "is-on", className)} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          <span className="launch-word" aria-hidden="true">
            <span style={{ transitionDelay: `${delayMs + i * stepMs}ms` }}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
