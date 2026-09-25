"use client";

import { usePathname, useRouter } from "next/navigation";
import { type RefObject, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSplashGate } from "../splash/useSplashGate";

const COLLAPSE_MS = 980;
// Route changes are pushed early: the collapse keeps playing over the new page
// (which mounts collapsed on the same label and plays the reverse).
const PUSH_AFTER_MS = 250;
const REVERSE_MS = 980;
const SCROLL_SETTLE_MS = 160;
const STORAGE_KEY = "glassnav:collapsed";
const PROTRUSION_PX = 5;
const SCROLL_THRESHOLD_PX = 40;
const SECTION_THRESHOLD = 0.35;
// Sections the capsule parks for without a cell of their own: say-hey parks on the home cell.
const EXTRA_SECTIONS: ReadonlyArray<{ id: string; index: number }> = [{ id: "say-hey", index: 0 }];

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

export type NavPhase = "idle" | "collapsing" | "expanding";
export type ArrivalClasses = { collapsed: string; trackFaded: string; chosen: string; faded: string };

type Input = {
  controller: RefObject<HTMLDivElement | null>;
  capsule: RefObject<HTMLDivElement | null>;
  cells: ReadonlyArray<{ href: string }>;
  // class names applied imperatively for the pre-paint collapsed frame on arrival
  classes: ArrivalClasses;
};

function readArrival(cellCount: number): number | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    const index = stored === null ? NaN : Number(stored);
    return Number.isFinite(index) && index >= 0 && index < cellCount ? index : null;
  } catch { return null; }
}

// The controller's behaviour: capsule parked on the in-view section's cell,
// sliding to the hovered/focused cell and back; the pointer-tracked
// highlight; the forward choreography before navigation and the reverse on
// arrival or once an in-page scroll settles. Geometry through custom
// properties only, measured from the content-sized cells.
export function useGlassNav({ controller, capsule, cells, classes }: Input) {
  const router = useRouter();
  const [phase, setPhase] = useState<NavPhase>("idle");
  const [chosen, setChosen] = useState<number | null>(null);
  // compressed past 40px of scroll; the header entrance waits for the splash
  const compressed = useSyncExternalStore(subscribeScroll, () => window.scrollY > SCROLL_THRESHOLD_PX, () => false);
  const entered = useSplashGate();
  const lock = useRef(false);
  const focused = useRef<number | null>(null);
  // On a page of its own (/for-creators, /for-agencies) the capsule parks on
  // that page's cell; on the landing the in-view section decides (below).
  const pathname = usePathname();
  const home = Math.max(0, cells.findIndex((cell) => cell.href === pathname));
  const parked = useRef(home);
  const homeRef = useRef(home);

  // Capsule over cell `index`: its measured box, plus the 5px protrusion on the outer cells.
  const setCapsule = (index: number) => {
    const cap = capsule.current;
    const el = controller.current;
    const cell = el?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!cap || !el || !cell) return;
    const first = index === 0, last = index === cells.length - 1;
    const left = cell.offsetLeft - (first ? PROTRUSION_PX : 0);
    const width = cell.offsetWidth + (first ? PROTRUSION_PX : 0) + (last ? PROTRUSION_PX : 0);
    cap.style.setProperty("--cap-left", `${left}px`);
    cap.style.setProperty("--cap-width", `${width}px`);
  };
  const park = () => setCapsule(parked.current);

  const expand = (index: number) => {
    setPhase("expanding");
    setChosen(null);
    park();
    window.setTimeout(() => {
      const cell = controller.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
      cell?.style.removeProperty("--dx");
      cell?.style.removeProperty("--dy");
      setPhase("idle");
      lock.current = false;
    }, REVERSE_MS);
  };

  // The label's travel to the collapsed capsule centre (the controller's centre).
  const placeChosen = (el: HTMLElement, cell: HTMLElement) => {
    const c = el.getBoundingClientRect();
    const b = cell.getBoundingClientRect();
    cell.style.setProperty("--dx", `${(c.left + c.width / 2 - (b.left + b.width / 2)).toFixed(1)}px`);
    cell.style.setProperty("--dy", `${(c.top + c.height / 2 - (b.top + b.height / 2)).toFixed(1)}px`);
  };

  // Route arrival: paint the first frame collapsed on the clicked label, then hand over and reverse.
  useLayoutEffect(() => {
    const el = controller.current;
    const index = readArrival(cells.length);
    if (!el || index === null) { park(); return; }
    lock.current = true;
    el.classList.add(classes.collapsed, classes.trackFaded);
    el.querySelectorAll<HTMLElement>("[data-index]").forEach((cell) => {
      if (Number(cell.dataset.index) !== index) cell.classList.add(classes.faded);
      else { placeChosen(el, cell); cell.classList.add(classes.chosen); }
    });
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.remove(classes.collapsed, classes.trackFaded);
      el.querySelectorAll<HTMLElement>("[data-index]").forEach((cell) => cell.classList.remove(classes.faded, classes.chosen));
      setChosen(index);
      expand(index);
    }));
    return () => cancelAnimationFrame(raf);
    // runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-measure the capsule on resize and after the 500ms compress/expand resize.
  useEffect(() => {
    const onResize = () => { if (!lock.current) park(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const t = window.setTimeout(() => { if (!lock.current && focused.current === null) park(); }, 520);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compressed]);

  // The nav lives in the layout and survives navigation: re-park on route change.
  useEffect(() => {
    homeRef.current = home;
    parked.current = home;
    if (!lock.current && focused.current === null) park();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Active section: the cell whose anchor section is in view parks the capsule; otherwise the page's own cell.
  useEffect(() => {
    const targets = [
      ...cells.map((cell, index) => ({ index, id: cell.href.includes("#") ? cell.href.slice(cell.href.indexOf("#") + 1) : null })),
      ...EXTRA_SECTIONS,
    ]
      .filter((t): t is { index: number; id: string } => t.id !== null)
      .map((t) => ({ index: t.index, el: document.getElementById(t.id) }))
      .filter((t): t is { index: number; el: HTMLElement } => t.el !== null);
    if (targets.length === 0) return;
    const visible = new Map<number, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { const t = targets.find((x) => x.el === e.target); if (t) visible.set(t.index, e.isIntersecting); });
      const active = targets.find((t) => visible.get(t.index));
      parked.current = active ? active.index : homeRef.current;
      if (!lock.current && focused.current === null && !controller.current?.matches(":hover")) park();
    }, { threshold: SECTION_THRESHOLD });
    targets.forEach((t) => io.observe(t.el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const collapse = (index: number) => {
    const el = controller.current;
    const cell = el?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!el || !cell) return false;
    lock.current = true;
    placeChosen(el, cell);
    setChosen(index);
    setPhase("collapsing");
    return true;
  };

  const navigate = (index: number, href: string) => {
    if (lock.current) return;
    const hash = href.indexOf("#");
    const anchor = hash >= 0 ? href.slice(hash) : null;
    const samePage = anchor !== null && (href.startsWith("#") || href.slice(0, hash) === window.location.pathname);
    if (!collapse(index)) { router.push(href); return; }
    if (samePage && anchor) {
      window.setTimeout(() => {
        document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
        let timer = 0;
        const settle = () => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => { window.removeEventListener("scroll", settle); expand(index); }, SCROLL_SETTLE_MS);
        };
        window.addEventListener("scroll", settle, { passive: true });
        settle();
      }, COLLAPSE_MS);
      return;
    }
    try { sessionStorage.setItem(STORAGE_KEY, String(index)); } catch { /* storage may be blocked */ }
    window.setTimeout(() => router.push(href), PUSH_AFTER_MS);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = controller.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--glass-x", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--glass-y", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  const hover = (index: number) => { if (!lock.current) setCapsule(index); };
  const focus = (index: number) => { focused.current = index; if (!lock.current) setCapsule(index); };
  const blur = (index: number) => {
    if (focused.current === index) focused.current = null;
    if (!lock.current && !controller.current?.matches(":hover")) park();
  };
  const leave = () => { if (lock.current || focused.current !== null) return; park(); };

  return { phase, chosen, compressed, entered, navigate, hover, focus, blur, leave, onPointerMove };
}
