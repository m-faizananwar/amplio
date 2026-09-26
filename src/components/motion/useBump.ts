"use client";

import { useState } from "react";

// A key that changes each time `value` moves (never on first render), so a
// CSS animation keyed on it replays: the badge bumps, the bell swings.
// `onlyUp` counts rises only (a new notification, not one being read).
export function useBump(value: number, { onlyUp = false }: { onlyUp?: boolean } = {}) {
  const [prev, setPrev] = useState(value);
  const [key, setKey] = useState(0);
  if (value !== prev) {
    setPrev(value);
    if (!onlyUp || value > prev) setKey((k) => k + 1);
  }
  return key;
}
