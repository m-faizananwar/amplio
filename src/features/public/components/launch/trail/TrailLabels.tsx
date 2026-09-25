"use client";

import { type RefObject, useEffect, useState } from "react";
import { layoutTrail, type TrailLayout } from "./trail-layout";

type Props = { host: RefObject<HTMLDivElement | null>; labels: { posts: string; site: string; ledger: string }; rows: number };

// Three small captions pinned to the drawing so it reads as a story, not a
// graph: where the posts are, where the brand's site is, where sign-ups land.
export function TrailLabels({ host, labels, rows }: Props) {
  const [t, setT] = useState<TrailLayout | null>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => setT(layoutTrail(el.clientWidth, el.clientHeight, { audience: 1, ledgerRows: Math.max(rows, 1) }));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [host, rows]);
  if (!t) return null;
  const tag = "num pointer-events-none absolute z-10 whitespace-nowrap text-caption text-ink-muted";
  return (
    <>
      <span className={tag} style={{ left: t.sources[0].x - 6, top: t.sources[0].y + 18 }}>{labels.posts}</span>
      <span className={tag} style={{ left: t.site.x - 24, top: t.site.y + 18 }}>{labels.site}</span>
      <span className={`${tag} text-money`} style={{ right: t.width - t.ledger.x - t.ledger.rowWidth - 10, top: t.ledger.top - 28 }}>{labels.ledger}</span>
    </>
  );
}
