"use client";

import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";

type Corner = "tl" | "tr" | "bl" | "br";
type Point = { x: number; y: number };

const KEY = "amplio.call.corner";
const MARGIN = 16;
const STEP = 24;
const DRAG_SLOP = 4;
// the click that ends a drag lands right after pointerup
const CLICK_AFTER_DRAG_MS = 300;
const MOVES: Record<string, Point> = { ArrowLeft: { x: -STEP, y: 0 }, ArrowRight: { x: STEP, y: 0 }, ArrowUp: { x: 0, y: -STEP }, ArrowDown: { x: 0, y: STEP } };

function saved(): Corner {
  try {
    const c = localStorage.getItem(KEY);
    return c === "tl" || c === "tr" || c === "bl" || c === "br" ? c : "br";
  } catch {
    return "br";
  }
}

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

// Where the floating call sits: one of four corners (remembered), or wherever
// a drag or the arrow keys hold it. Release (or Enter) snaps to the nearest
// corner; a spring in call.css does the travel. Always 16px inside the viewport.
export function useCallCorner(size: { w: number; h: number }) {
  const vp = useViewport();
  const [corner, setCorner] = useState<Corner>(saved);
  const [held, setHeld] = useState<Point | null>(null);
  const grab = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const dragged = useRef(false);
  const dragEnded = useRef(0);

  const clamp = (p: Point): Point => ({ x: Math.min(Math.max(p.x, MARGIN), vp.w - size.w - MARGIN), y: Math.min(Math.max(p.y, MARGIN), vp.h - size.h - MARGIN) });
  const home = clamp({ x: corner[1] === "l" ? MARGIN : vp.w - size.w - MARGIN, y: corner[0] === "t" ? MARGIN : vp.h - size.h - MARGIN });
  const pos = held ?? home;

  const snap = (p: Point) => {
    const next = `${p.y + size.h / 2 < vp.h / 2 ? "t" : "b"}${p.x + size.w / 2 < vp.w / 2 ? "l" : "r"}` as Corner;
    setCorner(next);
    setHeld(null);
    try { localStorage.setItem(KEY, next); } catch { /* private mode */ }
  };

  const handleProps = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      grab.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y };
      dragged.current = false;
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const g = grab.current;
      if (!g) return;
      const dx = e.clientX - g.px;
      const dy = e.clientY - g.py;
      if (!dragged.current && Math.hypot(dx, dy) < DRAG_SLOP) return;
      dragged.current = true;
      setHeld(clamp({ x: g.ox + dx, y: g.oy + dy }));
    },
    onPointerUp: () => {
      grab.current = null;
      if (!dragged.current) return;
      dragged.current = false;
      dragEnded.current = performance.now();
      if (held) snap(held);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const move = MOVES[e.key];
      if (move) {
        e.preventDefault();
        setHeld(clamp({ x: pos.x + move.x, y: pos.y + move.y }));
      } else if (e.key === "Enter" && held) {
        e.preventDefault();
        snap(held);
      }
    },
    onBlur: () => { if (held && !grab.current) snap(held); },
  };

  return {
    style: { transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` },
    moving: held !== null,
    handleProps,
    // a click that ended a drag isn't a click
    wasDrag: () => performance.now() - dragEnded.current < CLICK_AFTER_DRAG_MS,
  };
}
