"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Where you are in the story: the scenes' kickers as dots on one line — the
// mark's trail — pinned to the left edge on wide screens. The line fills as
// you go; the current dot turns green.
export function SceneRail({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  useEffect(() => {
    const scenes = ref.current?.parentElement?.querySelectorAll<HTMLElement>("[data-scene]");
    if (!scenes?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.scene));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    scenes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-y-0 left-6 z-10 hidden xl:block" aria-hidden="true">
      <div className="sticky top-[38vh] flex flex-col items-center">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            {i > 0 ? <span className={cn("h-7 w-px transition-colors duration-(--duration-base)", i <= active ? "bg-ink" : "bg-rule")} /> : null}
            <span className={cn("size-2.5 rounded-full border transition-[background-color,border-color,transform] duration-(--duration-base) ease-ledger", i === active ? "scale-125 border-money bg-money" : i < active ? "border-ink bg-ink" : "border-rule-strong bg-paper")} />
          </div>
        ))}
      </div>
    </div>
  );
}
