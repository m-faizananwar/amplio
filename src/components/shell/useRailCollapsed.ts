"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "amplio-rail-collapsed";
const EVENT = "amplio-rail";

// A per-browser convenience, so localStorage (guarded: it can throw in a
// private window). Server and first paint render the rail open.
const read = () => {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export function useRailCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const toggle = useCallback(() => {
    try {
      window.localStorage.setItem(KEY, read() ? "0" : "1");
    } catch {
      // storage refused: the rail just doesn't remember
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [collapsed, toggle];
}
