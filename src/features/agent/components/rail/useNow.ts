"use client";

import { useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;

// One clock for "2h ago" labels: 0 on the server and while hydrating (so the
// markup matches), the real time after, ticking once a minute.
let now = 0;
let timer = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) timer = window.setInterval(() => { now = Date.now(); listeners.forEach((l) => l()); }, MINUTE_MS);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { window.clearInterval(timer); timer = 0; }
  };
}

const snapshot = () => {
  if (!now) now = Date.now();
  return now;
};

export const useNow = () => useSyncExternalStore(subscribe, snapshot, () => 0);
