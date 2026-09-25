"use client";

import { useEffect } from "react";

import { crossfadeIfQuick } from "@/lib/motion/view-transition";

// Crossfades the page area between app routes where the browser has the View
// Transitions API, and does nothing at all where it doesn't (no polyfill).
// It never takes the click: Link still navigates and the route shell still
// sees it (both check defaultPrevented), this only asks the browser to
// snapshot first. It listens on window in the capture phase so the snapshot
// is requested before either of them runs.
export function ViewTransitions() {
  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;
    const onClick = (event: MouseEvent) => {
      const path = navigablePath(event);
      if (path) crossfadeIfQuick(() => window.location.pathname === path);
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

function navigablePath(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self") || link.hasAttribute("download")) return null;
  if (link.origin !== window.location.origin || link.hasAttribute("data-no-view-transition")) return null;
  if (link.pathname === window.location.pathname) return null;
  // A navigation already in flight belongs to the route shell.
  if (document.querySelector("[data-route-shell][data-route-stale]")) return null;
  return link.pathname;
}
