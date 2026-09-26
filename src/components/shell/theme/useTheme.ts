"use client";

import { useCallback, useSyncExternalStore } from "react";
import { choiceFromCookie, DEFAULT_THEME_CHOICE, resolveTheme, THEME_COOKIE, type Theme, type ThemeChoice } from "./theme";

const YEAR_S = 60 * 60 * 24 * 365;
const CHOICE_EVENT = "amplio-theme-choice";
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

// The class on <html> (set by the boot script) is the truth for what shows;
// the cookie is the truth for what was picked. Both are observed, so every
// toggle on the page agrees without a context.
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener(CHOICE_EVENT, cb);
  return () => {
    mo.disconnect();
    window.removeEventListener(CHOICE_EVENT, cb);
  };
};
const readChoice = (): ThemeChoice => choiceFromCookie(document.cookie);
const readResolved = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

const FADE_MS = 200;

// The switch cross-fades colours for 200ms; the transition is taken off right
// after so hovers don't inherit it. No fade under reduced motion.
function apply(choice: ThemeChoice) {
  const dark = resolveTheme(choice, darkQuery().matches) === "dark";
  const root = document.documentElement;
  const fade = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fade) root.classList.add("theme-fade");
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  if (fade) window.setTimeout(() => root.classList.remove("theme-fade"), FADE_MS);
}

// every pick is stored, "system" included: no cookie means light
function persist(choice: ThemeChoice) {
  document.cookie = `${THEME_COOKIE}=${choice}; path=/; max-age=${YEAR_S}; samesite=lax`;
}

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => DEFAULT_THEME_CHOICE);
  const resolved = useSyncExternalStore(subscribe, readResolved, () => "light" as Theme);
  const choose = useCallback((next: ThemeChoice) => {
    persist(next);
    apply(next);
    window.dispatchEvent(new Event(CHOICE_EVENT));
  }, []);
  return { choice, resolved, choose };
}
