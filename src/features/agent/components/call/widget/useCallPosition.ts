"use client";

import { type CSSProperties, type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Size = { w: number; h: number };
// the window's top-left as a fraction of the viewport, so it survives resizes
type Saved = { fx: number; fy: number };

const KEY = "amplio.call.position";
const MARGIN = 16;
const STEP = 16;
const BIG_STEP = 64;
const DRAG_SLOP = 4;
// the click that ends a drag lands right after pointerup
const CLICK_AFTER_DRAG_MS = 300;
const MOVES: Record<string, Point> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } };

function load(): Saved | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Saved> | null;
    return v && typeof v.fx === "number" && typeof v.fy === "number" ? { fx: v.fx, fy: v.fy } : null;
  } catch {
    return null;
  }
}

function store(v: Saved | null) {
  try {
    if (v) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  } catch { /* private mode */ }
}

function useViewport(): Size {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

const clampTo = (vp: Size, s: Size) => (p: Point): Point => ({
  x: Math.min(Math.max(p.x, MARGIN), vp.w - s.w - MARGIN),
  y: Math.min(Math.max(p.y, MARGIN), vp.h - s.h - MARGIN),
});

// The window and its bubble share one place: the bubble sits in the window's
// box, on the side nearer the viewport's edge (bottom-right window → bubble in
// its bottom-right corner). These convert between the box and a frame in it.
function frameIn(box: Point, vp: Size, sizes: { box: Size; frame: Size }): Point {
  const left = box.x + sizes.box.w / 2 < vp.w / 2;
  const top = box.y + sizes.box.h / 2 < vp.h / 2;
  return { x: left ? box.x : box.x + sizes.box.w - sizes.frame.w, y: top ? box.y : box.y + sizes.box.h - sizes.frame.h };
}
function boxOf(frame: Point, vp: Size, sizes: { box: Size; frame: Size }): Point {
  const left = frame.x + sizes.frame.w / 2 < vp.w / 2;
  const top = frame.y + sizes.frame.h / 2 < vp.h / 2;
  return { x: left ? frame.x : frame.x + sizes.frame.w - sizes.box.w, y: top ? frame.y : frame.y + sizes.frame.h - sizes.box.h };
}

// In the lower half the frame hangs from the bottom edge, so a window whose
// height follows its content (the summary) shrinks toward where it sits.
function placeStyle(p: Point, vp: Size, frame: Size): CSSProperties {
  if (p.y + frame.h / 2 < vp.h / 2) return { top: 0, bottom: "auto", transform: `translate3d(${p.x}px, ${p.y}px, 0)` };
  return { top: "auto", bottom: 0, transform: `translate3d(${p.x}px, ${-(vp.h - p.y - frame.h)}px, 0)` };
}

const nudge = (p: Point, d: Point, step: number): Point => ({ x: p.x + d.x * step, y: p.y + d.y * step });

type HandleOptions = { pos: Point; clamp: (p: Point) => Point; commit: (p: Point) => void; reset: () => void };

// Pointer, keys and double-click on the handle; `held` is where a drag holds
// the frame until it's dropped.
function useDragHandle() {
  const [held, setHeld] = useState<Point | null>(null);
  const grab = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const dragged = useRef(false);
  const dragEnded = useRef(0);
  const props = ({ pos, clamp, commit, reset }: HandleOptions) => ({
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
    // dropped where the pointer let go, not where the last (coalesced) move was
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const g = grab.current;
      grab.current = null;
      if (!g || !dragged.current) return;
      dragged.current = false;
      dragEnded.current = performance.now();
      commit(clamp({ x: g.ox + e.clientX - g.px, y: g.oy + e.clientY - g.py }));
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const move = MOVES[e.key];
      if (!move) return;
      e.preventDefault();
      commit(clamp(nudge(pos, move, e.shiftKey ? BIG_STEP : STEP)));
    },
    onDoubleClick: reset,
  });
  // a click that ended a drag isn't a click
  const wasDrag = () => performance.now() - dragEnded.current < CLICK_AFTER_DRAG_MS;
  return { held, setHeld, props, wasDrag };
}

// Where the floating call sits: wherever it was dropped (remembered), 16px
// inside the viewport and re-clamped on resize; bottom-right until moved.
// Arrow keys move it 16px (Shift 64px); double-click puts it back home.
export function useCallPosition(frame: Size, box: Size) {
  const vp = useViewport();
  const [saved, setSaved] = useState<Saved | null>(load);
  const drag = useDragHandle();
  const sizes = { box, frame };
  const clamp = clampTo(vp, frame);
  const home = { x: vp.w - box.w - MARGIN, y: vp.h - box.h - MARGIN };
  const boxAt = clampTo(vp, box)(saved ? { x: saved.fx * vp.w, y: saved.fy * vp.h } : home);
  const pos = drag.held ?? clamp(frameIn(boxAt, vp, sizes));
  const keep = (next: Saved | null) => {
    setSaved(next);
    drag.setHeld(null);
    store(next);
  };
  const commit = (p: Point) => {
    const b = boxOf(p, vp, sizes);
    keep({ fx: b.x / vp.w, fy: b.y / vp.h });
  };
  return {
    style: placeStyle(pos, vp, frame),
    moving: drag.held !== null,
    handleProps: drag.props({ pos, clamp, commit, reset: () => keep(null) }),
    wasDrag: drag.wasDrag,
  };
}
