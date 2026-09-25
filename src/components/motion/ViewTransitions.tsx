"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { startViewTransitionNav, VIEW_TRANSITION_MAX_MS } from "@/lib/motion/view-transition";

// Crossfades the page area between app routes where the browser has the View
// Transitions API, and does nothing at all where it doesn't (no polyfill).
// It only ever starts a transition on a click it is sure about: a plain left
// click on a same-origin in-app link, with no navigation already pending —
// the main builder's wrapper owns the screen from the moment it marks itself
// stale, and two animations over one navigation is one too many.
export function ViewTransitions() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (event: MouseEvent) => {
      const href = navigableHref(event);
      if (!href) return;
      event.preventDefault();
      const target = href.split("?")[0];
      startViewTransitionNav(() => router.push(href), () => window.location.pathname === target && !document.querySelector('main [aria-busy="true"]'));
    };
    // Capture, so this runs before Link's own handler — which then sees the
    // click already handled and leaves the navigation to us.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}

function navigableHref(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return null;
  if (link.origin !== window.location.origin || link.hasAttribute("data-no-view-transition")) return null;
  const href = link.pathname + link.search;
  if (link.pathname === window.location.pathname) return null;
  // While the route shell is holding the old page, the screen is already spoken for.
  if (document.querySelector("[data-route-shell][data-route-stale]")) return null;
  return VIEW_TRANSITION_MAX_MS > 0 ? href : null;
}
