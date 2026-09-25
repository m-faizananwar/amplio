"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";

// Plays a one-time "assembles itself" entrance for a block the first time it
// is seen in this tab. The class ships in the server HTML so the first paint
// animates; on later client visits it is removed before paint.
export function AssembleOnce({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // decided once per mount: Strict Mode's second run would read the flag the
  // first run just wrote and cancel the entrance
  const firstView = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const key = `assembled:${id}`;
    if (firstView.current === null) {
      try {
        firstView.current = !sessionStorage.getItem(key);
        sessionStorage.setItem(key, "1");
      } catch {
        // storage blocked: the entrance just plays each visit
        firstView.current = true;
      }
    }
    if (!firstView.current) ref.current?.classList.remove("assemble");
  }, [id]);
  return <div ref={ref} className={`assemble ${className}`}>{children}</div>;
}
