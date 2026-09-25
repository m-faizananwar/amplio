"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import type { TrailCounts, TrailScene } from "./trail-scene";
import { TrailFallback } from "./TrailFallback";

function hasWebgl() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

// Mounts the static drawing at once, then — after first paint, when the
// browser is idle — loads three.js and swaps in the live layer. The live layer
// runs only while the hero is on screen and the tab is visible.
export function TrailCanvas({ counts }: { counts: TrailCounts }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !hasWebgl()) return;
    let scene: TrailScene | null = null;
    let cancelled = false;
    let visible = true;
    const el = host.current;
    const c = canvas.current;
    if (!el || !c) return;

    const sync = () => (visible && !document.hidden ? scene?.start() : scene?.stop());
    const resize = () => scene?.resize(el.clientWidth, el.clientHeight);
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      scene?.setPointer(e.clientX - r.left, e.clientY - r.top);
    };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      scene?.setFade(Math.max(0, Math.min(1, 1 + r.top / (r.height * 0.8))));
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(resize);

    const load = () =>
      import("./trail-scene").then(({ createTrailScene }) => {
        if (cancelled) return;
        scene = createTrailScene(c, counts);
        resize();
        onScroll();
        setLive(true);
        io.observe(el);
        ro.observe(el);
        sync();
      });
    const canIdle = typeof window.requestIdleCallback === "function";
    const idle = canIdle ? window.requestIdleCallback(() => void load(), { timeout: 1500 }) : globalThis.setTimeout(() => void load(), 300);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelled = true;
      if (canIdle) window.cancelIdleCallback(idle as number);
      else globalThis.clearTimeout(idle);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
      scene?.dispose();
    };
  }, [counts, reduced]);

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      <div className={live ? "absolute inset-0 opacity-0 transition-opacity duration-300" : "absolute inset-0"}>
        <TrailFallback signups={counts.signups} />
      </div>
      <canvas ref={canvas} className={live ? "absolute inset-0 size-full opacity-100 transition-opacity duration-300" : "absolute inset-0 size-full opacity-0"} />
    </div>
  );
}
