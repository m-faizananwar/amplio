"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Tip = { text: string; x: number; y: number; side: "below" | "right" };

const GAP = 8;
const EDGE = 8;
const HIDE_MS = 90;
const SHOW_MS = 350;

// One tooltip for every icon-only control: anything with data-tip (Button
// adds it to icon sizes from their aria-label). Moving from one to the next
// while it is up, it slides across and reshapes around the new label instead
// of disappearing and popping up again. Decorative: the control's own
// aria-label is what assistive tech reads.
export function SlidingTooltip() {
  const [tip, setTip] = useState<Tip | null>(null);
  // hidden keeps the last spot; a fresh appearance jumps there and fades in,
  // only a move between two tips travels
  const [shown, setShown] = useState(false);
  const [fresh, setFresh] = useState(true);
  const [width, setWidth] = useState(0);
  const measure = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<number>(0);
  const showTimer = useRef<number>(0);
  const visible = useRef(false);

  useEffect(() => {
    const place = (el: HTMLElement): Tip => {
      const r = el.getBoundingClientRect();
      const side = el.dataset.tipSide === "right" ? "right" : "below";
      return side === "right"
        ? { text: el.dataset.tip ?? "", x: r.right + GAP, y: r.top + r.height / 2, side }
        : { text: el.dataset.tip ?? "", x: r.left + r.width / 2, y: r.bottom + GAP, side };
    };
    const enter = (event: Event) => {
      const el = (event.target as Element | null)?.closest?.<HTMLElement>("[data-tip]");
      if (!el?.dataset.tip) return;
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(showTimer.current);
      // already up: move now; otherwise wait a beat so passing over doesn't flash it
      const show = () => { setFresh(!visible.current); visible.current = true; setTip(place(el)); setShown(true); };
      if (visible.current) show();
      else showTimer.current = window.setTimeout(show, SHOW_MS);
    };
    const leave = (event: Event) => {
      if (!(event.target as Element | null)?.closest?.("[data-tip]")) return;
      window.clearTimeout(showTimer.current);
      hideTimer.current = window.setTimeout(() => { visible.current = false; setShown(false); }, HIDE_MS);
    };
    document.addEventListener("pointerover", enter);
    document.addEventListener("focusin", enter);
    document.addEventListener("pointerout", leave);
    document.addEventListener("focusout", leave);
    document.addEventListener("pointerdown", leave);
    return () => {
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("focusin", enter);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("focusout", leave);
      document.removeEventListener("pointerdown", leave);
    };
  }, []);

  // the label's own width, so the bubble can animate to it
  useLayoutEffect(() => {
    if (tip && measure.current) setWidth(measure.current.offsetWidth);
  }, [tip]);

  const half = width / 2;
  const x = tip ? (tip.side === "below" ? Math.min(Math.max(tip.x - half, EDGE), window.innerWidth - width - EDGE) : tip.x) : 0;
  const y = tip ? (tip.side === "below" ? tip.y : tip.y - 14) : 0;
  return (
    <div aria-hidden="true" className="sliding-tip" data-visible={shown ? "" : undefined} data-fresh={fresh ? "" : undefined} style={{ translate: `${x}px ${y}px`, width: width || undefined }}>
      <span ref={measure} className="sliding-tip-measure">{tip?.text}</span>
      <span className="sliding-tip-text">{tip?.text}</span>
    </div>
  );
}
