"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { RouteSkeleton } from "./RouteSkeleton";
import styles from "./route-transition.module.css";

// A per-segment loading.tsx replaces the page the moment you click, so every
// sidebar swap flashed a skeleton even when the next page was 200 ms away.
// This keeps the page you are looking at on screen instead: dimmed, with a
// progress bar, and only falls back to a skeleton when the wait gets long
// enough that a frozen page would read as a broken one.
//
// The Suspense boundary is what streams the shell on a cold load. It is
// already mounted during a client navigation, so react keeps the old children
// rather than showing its fallback — which is the whole point.

const SKELETON_AFTER_MS = 300;
// A click that never becomes a navigation (a dialog trigger, a blocked link,
// a redirect back to where we are): let the page go solid again.
const GIVE_UP_MS = 8000;

function isPlainLeftClick(event: MouseEvent) {
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

// True for a link that this router will handle: same origin, new path, same tab.
function navigatesAway(anchor: HTMLAnchorElement, pathname: string) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  return url.pathname !== pathname;
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The path we were on when the click happened. While it still matches, the
  // navigation has not committed — deriving it this way means the commit ends
  // the pending state on its own, with no effect to clean up after it.
  const [clickedFrom, setClickedFrom] = useState<string | null>(null);
  const [stalledOn, setStalledOn] = useState<string | null>(null);
  const pending = clickedFrom === pathname;
  const stalled = pending && stalledOn === pathname;

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isPlainLeftClick(event)) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (anchor instanceof HTMLAnchorElement && navigatesAway(anchor, pathname)) setClickedFrom(pathname);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const skeleton = setTimeout(() => setStalledOn(pathname), SKELETON_AFTER_MS);
    const giveUp = setTimeout(() => setClickedFrom(null), GIVE_UP_MS);
    return () => {
      clearTimeout(skeleton);
      clearTimeout(giveUp);
    };
  }, [pending, pathname]);

  return (
    <div className={styles.shell} data-route-shell data-route-stale={pending ? "true" : undefined}>
      {/* The bar is the only thing that moves while we wait; aria-busy tells the rest. */}
      <div className={styles.progress} aria-hidden="true" />
      <div className={styles.page} aria-busy={pending ? "true" : undefined}>
        <Suspense fallback={<RouteSkeleton />}>
          {stalled ? <RouteSkeleton /> : <div key={pathname} className="animate-section">{children}</div>}
        </Suspense>
      </div>
    </div>
  );
}
