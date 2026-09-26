"use client";

import { type RefObject, useCallback, useEffect, useState, useSyncExternalStore } from "react";

const SOLID_AFTER_PX = 40;
const PORTRAIT = "(max-aspect-ratio: 1/1)";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

// Past 40px of scroll the landing's header frosts and tightens; every other
// page starts that way. The burger menu closes on a link, a click outside,
// Escape (focus goes back to the burger), a route change, and when the frame
// turns landscape (where the menu is no longer a dropdown).
export function useHeaderState({ landing, header, burger, pathname }: {
  landing: boolean;
  header: RefObject<HTMLElement | null>;
  burger: RefObject<HTMLButtonElement | null>;
  pathname: string;
}) {
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > SOLID_AFTER_PX, () => false);
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  // a route change closes the menu (state adjusted during render, not in an effect)
  if (seenPath !== pathname) { setSeenPath(pathname); setOpen(false); }

  const close = useCallback((refocus = false) => {
    setOpen(false);
    if (refocus) burger.current?.focus();
  }, [burger]);
  const toggle = () => setOpen((o) => !o);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(true); };
    const onDown = (e: PointerEvent) => { if (!header.current?.contains(e.target as Node)) close(); };
    const mq = window.matchMedia(PORTRAIT);
    const onShape = () => { if (!mq.matches) close(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    mq.addEventListener("change", onShape);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      mq.removeEventListener("change", onShape);
    };
  }, [open, close, header]);

  const solid = !landing || scrolled;
  // the landing's hero at the top: the assistant's corner button steps aside (interaction.css)
  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-hero-top", !solid);
    return () => root.removeAttribute("data-hero-top");
  }, [solid]);

  return { solid, open, toggle, close };
}
