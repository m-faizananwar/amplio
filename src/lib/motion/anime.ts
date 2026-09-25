// The one door to anime.js. Every call site goes through these helpers so
// reduced motion is a single switch: under prefers-reduced-motion each helper
// applies the end state synchronously and returns a resolved handle.
import { type AnimationParams, animate, createTimeline, cubicBezier, stagger as animeStagger, svg, utils } from "animejs";

// The ledger curve (DIRECTION: ease-out cubic-bezier(.2,.8,.2,1)); anime v4
// takes easing functions, the old string syntax warns and is ignored.
const EASE_X1 = 0.2;
const EASE_Y1 = 0.8;
const EASE_X2 = 0.2;
const EASE_Y2 = 1;
export const MOTION_EASE = cubicBezier(EASE_X1, EASE_Y1, EASE_X2, EASE_Y2);
export const MOTION_MAX_MS = 800; // nothing over 800ms
const REVEAL_MS = 520;
const REVEAL_Y = 12;
const STAGGER_EACH_MS = 30;
const STAGGER_MS = 360;
const COUNT_MS = 700;
const DRAW_MS = 800;
const DIALOG_MS = 320;
const DIALOG_Y = 10;
const DIALOG_SCALE = 0.98;

export type MotionHandle = { finished: Promise<void>; cancel: () => void };
const DONE: MotionHandle = { finished: Promise.resolve(), cancel: () => undefined };

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const clampMs = (ms: number) => Math.min(ms, MOTION_MAX_MS);
const toHandle = (anim: { then: (cb: () => void) => unknown; cancel: () => unknown }): MotionHandle => ({
  finished: new Promise<void>((resolve) => { anim.then(() => resolve()); }),
  cancel: () => { anim.cancel(); },
});

// Fade + rise one element into place.
export function reveal(el: Element | null, opts: { delay?: number; y?: number; duration?: number } = {}): MotionHandle {
  if (!el) return DONE;
  if (reducedMotion()) { clearInline([el]); return DONE; }
  utils.set(el, { opacity: 0, translateY: opts.y ?? REVEAL_Y });
  return toHandle(animate(el, { opacity: 1, translateY: 0, duration: clampMs(opts.duration ?? REVEAL_MS), delay: opts.delay ?? 0, ease: MOTION_EASE, onComplete: () => clearInline([el]) }));
}

// Rows/cards appear one after another (default 30ms apart), e.g. after a filter change.
export function stagger(list: ArrayLike<Element> | Element[], opts: { each?: number; from?: "first" | "last" | "center"; y?: number; duration?: number } = {}): MotionHandle {
  const targets = Array.from(list);
  if (targets.length === 0) return DONE;
  if (reducedMotion()) { clearInline(targets); return DONE; }
  utils.set(targets, { opacity: 0, translateY: opts.y ?? REVEAL_Y });
  return toHandle(animate(targets, {
    opacity: 1, translateY: 0, duration: clampMs(opts.duration ?? STAGGER_MS), ease: MOTION_EASE,
    delay: animeStagger(opts.each ?? STAGGER_EACH_MS, { from: opts.from ?? "first" }),
    // leave no inline transform/opacity behind, so css :hover lifts still apply
    onComplete: () => clearInline(targets),
  }));
}

function clearInline(targets: Element[]) {
  for (const t of targets) { const el = t as HTMLElement; el.style.removeProperty("transform"); el.style.removeProperty("opacity"); }
}

// Count a number up in the element's text; `format` renders each frame.
export function countUp(el: Element | null, to: number, opts: { duration?: number; from?: number; format?: (n: number) => string } = {}): MotionHandle {
  if (!el) return DONE;
  const format = opts.format ?? ((n: number) => Math.round(n).toLocaleString());
  const target = el as HTMLElement;
  if (reducedMotion()) { target.textContent = format(to); return DONE; }
  const state = { n: opts.from ?? 0 };
  target.textContent = format(state.n);
  return toHandle(animate(state, {
    n: to, duration: clampMs(opts.duration ?? COUNT_MS), ease: MOTION_EASE,
    onUpdate: () => { target.textContent = format(state.n); },
    onComplete: () => { target.textContent = format(to); },
  }));
}

// Draw an SVG path/line/polyline from nothing to its full length.
export function drawPath(path: SVGGeometryElement | null, opts: { duration?: number; delay?: number } = {}): MotionHandle {
  if (!path) return DONE;
  if (reducedMotion()) { path.style.strokeDasharray = ""; path.style.strokeDashoffset = ""; return DONE; }
  return toHandle(animate(svg.createDrawable(path), { draw: "0 1", duration: clampMs(opts.duration ?? DRAW_MS), delay: opts.delay ?? 0, ease: MOTION_EASE }));
}

// Dialog / drawer enter and exit with the 0.16,1,0.3,1 curve. `axis` picks
// the travel: y for centred dialogs, x for a side drawer.
export function enter(el: Element | null, opts: { axis?: "x" | "y"; distance?: number; duration?: number } = {}): MotionHandle {
  if (!el) return DONE;
  const axis = opts.axis ?? "y";
  const distance = opts.distance ?? DIALOG_Y;
  if (reducedMotion()) { utils.set(el, { opacity: 1, translateX: 0, translateY: 0, scale: 1 }); return DONE; }
  utils.set(el, { opacity: 0, [axis === "x" ? "translateX" : "translateY"]: distance, scale: axis === "y" ? DIALOG_SCALE : 1 });
  return toHandle(animate(el, { opacity: 1, translateX: 0, translateY: 0, scale: 1, duration: clampMs(opts.duration ?? DIALOG_MS), ease: MOTION_EASE }));
}

export function exit(el: Element | null, opts: { axis?: "x" | "y"; distance?: number; duration?: number } = {}): MotionHandle {
  if (!el) return DONE;
  if (reducedMotion()) { utils.set(el, { opacity: 0 }); return DONE; }
  const axis = opts.axis ?? "y";
  return toHandle(animate(el, {
    opacity: 0, [axis === "x" ? "translateX" : "translateY"]: opts.distance ?? DIALOG_Y, scale: axis === "y" ? DIALOG_SCALE : 1,
    duration: clampMs(opts.duration ?? DIALOG_MS), ease: MOTION_EASE,
  }));
}

export type TimelineStep = {
  target: Element | Element[] | ArrayLike<Element> | Record<string, number>;
  props: AnimationParams;
  duration?: number;
  // absolute ms, or "<" / "<<" / "+=N" relative to the previous step
  at?: number | string;
};

// A sequence of steps on one clock; reduced motion applies every step's end state.
export function timeline(steps: TimelineStep[]): MotionHandle {
  if (steps.length === 0) return DONE;
  if (reducedMotion()) {
    for (const step of steps) {
      const end = Object.fromEntries(Object.entries(step.props).filter(([k]) => !["onUpdate", "onComplete", "ease", "delay"].includes(k)));
      utils.set(step.target as Element, end);
      (step.props.onComplete as ((a: unknown) => void) | undefined)?.(undefined);
    }
    return DONE;
  }
  const tl = createTimeline({ defaults: { ease: MOTION_EASE } });
  for (const step of steps) {
    tl.add(step.target as Element, { ...step.props, duration: clampMs(step.duration ?? REVEAL_MS) }, step.at as number | undefined);
  }
  return toHandle(tl);
}
