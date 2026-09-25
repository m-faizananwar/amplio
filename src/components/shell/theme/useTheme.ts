"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isThemeChoice, THEME_COOKIE, type Theme, type ThemeChoice } from "./theme";

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
const readChoice = (): ThemeChoice => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([a-z]+)`));
  return match && isThemeChoice(match[1]) ? match[1] : "system";
};
const readResolved = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && darkQuery().matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

function persist(choice: ThemeChoice) {
  document.cookie = choice === "system"
    ? `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`
    : `${THEME_COOKIE}=${choice}; path=/; max-age=${YEAR_S}; samesite=lax`;
}

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice);
  const resolved = useSyncExternalStore(subscribe, readResolved, () => "light" as Theme);
  const choose = useCallback((next: ThemeChoice) => {
    persist(next);
    apply(next);
    window.dispatchEvent(new Event(CHOICE_EVENT));
  }, []);
  return { choice, resolved, choose };
}
