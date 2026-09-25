// Section reveals:
// a one-shot 8px rise per [data-morph] element, staggered 20ms by its
// position within its section (max 220ms), fired by an IntersectionObserver a
// touch before the element is on screen (rootMargin 0 0 -10% 0); a section a
// full viewport clear of the view is released so it replays on the way back
// down, keyed to the section so its tiles pop together. Hidden state lives
// only behind html.pop-ready, so nothing is invisible without JS. Pure DOM,
// no framework imports.

const STAGGER = 20; // ms between tiles of one section (DIRECTION: lists stagger 20ms)
const MAX_DELAY = 220;
const POP = "is-pop";
const POP_Y_PERCENT = 8;
const POP_SCALE = "0.94";

// Tiles live at module level, apart from the observer: React Strict Mode runs
// the root's effect twice (start → cleanup → start), and tiles registered
// between the two must survive into the second observer or they stay hidden.
const els = new Set<HTMLElement>();
const groupOf = new Map<HTMLElement, HTMLElement>();
type Observer = { io: IntersectionObserver | null; raf: number; reduced: boolean };
let obs: Observer | null = null;

function groupFor(el: HTMLElement) {
  return (el.closest("[data-morph-group]") ?? el.closest("section") ?? el) as HTMLElement;
}

function watch(el: HTMLElement) {
  if (!obs) return;
  if (obs.reduced) el.classList.add(POP); else obs.io?.observe(el);
}

// Attach the observer and the release loop once (the root layout mounts it).
export function startScrollMorph(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("pop-ready");
  const io = reduced ? null : new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add(POP);
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
  obs = { io, raf: 0, reduced };
  for (const el of els) watch(el);
  const check = () => {
    if (!obs) return;
    obs.raf = 0;
    const vh = window.innerHeight;
    for (const g of new Set(groupOf.values())) {
      if (g.getBoundingClientRect().top < vh) continue;
      for (const el of els) if (groupOf.get(el) === g) el.classList.remove(POP);
    }
  };
  const onScroll = () => { if (obs && !obs.raf) obs.raf = requestAnimationFrame(check); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  return () => {
    io?.disconnect();
    if (obs) cancelAnimationFrame(obs.raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    document.documentElement.classList.remove("pop-ready");
    obs = null;
  };
}

// Register a section's tiles (called by Reveal after it has marked them).
// Index within the section sets the stagger. Tiles registered before the
// observer starts (children's effects run before the root's) are picked up
// when it does.
export function registerMorph(list: HTMLElement[]): () => void {
  if (list.length === 0) return () => undefined;
  const seen = new Map<HTMLElement, number>();
  for (const el of list) {
    const g = groupFor(el);
    groupOf.set(el, g);
    els.add(el);
    const i = seen.get(g) ?? 0;
    seen.set(g, i + 1);
    el.style.setProperty("--pop-y", `${el.dataset.morphY ?? POP_Y_PERCENT}%`);
    el.style.setProperty("--pop-s", el.dataset.morphScale ?? POP_SCALE);
    el.style.setProperty("--pop-d", `${Math.min(i * STAGGER, MAX_DELAY)}ms`);
    watch(el);
  }
  return () => unregister(list);
}

function unregister(list: HTMLElement[]) {
  for (const el of list) { obs?.io?.unobserve(el); els.delete(el); groupOf.delete(el); el.classList.remove(POP); }
}
