"use client";

import { useCallback, useSyncExternalStore } from "react";
import { setTheme } from "./actions";
import type { Theme } from "./theme";

// The `.dark` class on <html> is the source of truth on the client (the root
// layout set it from the cookie); toggling flips it at once and saves the
// cookie in the background so the next server render agrees.
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};
const read = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const toggle = useCallback(() => {
    const next: Theme = read() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    void setTheme(next);
  }, []);
  return [theme, toggle];
}
