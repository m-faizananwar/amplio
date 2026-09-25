// Section reveals, blovio's model (customers/tanguy_blovio/src/useScrollMorph.ts):
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

type Registry = { els: Set<HTMLElement>; groupOf: Map<HTMLElement, HTMLElement>; io: IntersectionObserver | null; raf: number; reduced: boolean };
let reg: Registry | null = null;
// tiles registered before the observer started (children's layout effects run before the root's effect)
const pending: HTMLElement[][] = [];

function groupFor(el: HTMLElement) {
  return (el.closest("[data-morph-group]") ?? el.closest("section") ?? el) as HTMLElement;
}

// Attach the observer and the release loop once (the root layout mounts it).
export function startScrollMorph(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("pop-ready");
  const io = reduced ? null : new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add(POP);
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
  reg = { els: new Set(), groupOf: new Map(), io, raf: 0, reduced };
  for (const els of pending.splice(0)) registerMorph(els);
  const check = () => {
    if (!reg) return;
    reg.raf = 0;
    const vh = window.innerHeight;
    for (const g of new Set(reg.groupOf.values())) {
      if (g.getBoundingClientRect().top < vh) continue;
      for (const el of reg.els) if (reg.groupOf.get(el) === g) el.classList.remove(POP);
    }
  };
  const onScroll = () => { if (reg && !reg.raf) reg.raf = requestAnimationFrame(check); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  return () => {
    io?.disconnect();
    if (reg) cancelAnimationFrame(reg.raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    document.documentElement.classList.remove("pop-ready");
    reg = null;
  };
}

// Register a section's tiles (called by Reveal after it has marked them).
// Index within the section sets the stagger; headings (data-morph="text")
// run textReveal instead of the pop.
export function registerMorph(els: HTMLElement[]): () => void {
  if (els.length === 0) return () => undefined;
  if (!reg) {
    pending.push(els);
    return () => { const i = pending.indexOf(els); if (i >= 0) pending.splice(i, 1); else unregister(els); };
  }
  const r = reg;
  const seen = new Map<HTMLElement, number>();
  for (const el of els) {
    const g = groupFor(el);
    r.groupOf.set(el, g);
    r.els.add(el);
    const i = seen.get(g) ?? 0;
    seen.set(g, i + 1);
    el.style.setProperty("--pop-y", `${el.dataset.morphY ?? POP_Y_PERCENT}%`);
    el.style.setProperty("--pop-s", el.dataset.morphScale ?? POP_SCALE);
    el.style.setProperty("--pop-d", `${Math.min(i * STAGGER, MAX_DELAY)}ms`);
    if (r.reduced) el.classList.add(POP); else r.io?.observe(el);
  }
  return () => unregister(els);
}

function unregister(els: HTMLElement[]) {
  if (!reg) return;
  for (const el of els) { reg.io?.unobserve(el); reg.els.delete(el); reg.groupOf.delete(el); el.classList.remove(POP); }
}
