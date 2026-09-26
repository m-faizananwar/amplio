"use client";

import { flushSync } from "react-dom";

// Filtering a list: rows that leave fade out while the rest slide up to close
// the gap, and rows that arrive fade in. The rows carry a view-transition
// name (listRowStyle) and the state change runs inside a View Transition;
// the browser animates each row between its old and new place. Without the
// API, or under reduced motion, the list simply updates.
export function useListTransition() {
  return (update: () => void) => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document === "undefined" || !("startViewTransition" in document) || reduced) {
      update();
      return;
    }
    document.startViewTransition(() => flushSync(update));
  };
}

// Unique per row on the page; view-transition names must be valid idents.
export function listRowStyle(id: string) {
  return { viewTransitionName: `row-${id.replace(/[^a-zA-Z0-9_-]/g, "")}` } as const;
}
