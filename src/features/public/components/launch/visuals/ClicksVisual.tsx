"use client";

import { useRef } from "react";
import { RollingNumber } from "@/components/ui/rolling-number";
import { useInView } from "../useInView";

type Props = { clicks: number; label: string; liveLabel: string; rowLabel: string };

// Scene 3: clicks light up. The count is the demo workspace's real total; the
// rows below it are what each click becomes (a row with its source).
export function ClicksVisual({ clicks, label, liveLabel, rowLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.4, repeat: true });
  return (
    <div ref={ref} className="mx-auto w-full max-w-md">
      <p className="text-[clamp(64px,11vw,120px)] font-semibold leading-none tracking-[-0.04em]">
        <RollingNumber value={on ? clicks : 0} />
      </p>
      <p className="mt-2 text-lead text-ink-muted">
        {label} <span className="text-caption">· {liveLabel}</span>
      </p>
      <ul className="mt-8 divide-y divide-rule border-y border-rule" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="cut flex items-center gap-3 py-3 text-small" style={{ ["--d" as string]: `${200 + i * 90}ms` }}>
            <span className="relative flex size-2">
              <span className="ping absolute inset-0 rounded-full bg-ink" style={{ ["--d" as string]: `${i * 200}ms` }} />
              <span className="relative size-2 rounded-full bg-ink" />
            </span>
            <span>{rowLabel}</span>
            <span className="num ml-auto text-ink-muted">linkedin.com</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
