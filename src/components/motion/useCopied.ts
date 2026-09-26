"use client";

import { useCallback, useEffect, useState } from "react";

const SHOW_MS = 1600;

// A key for CopyGlyph: bumps on each successful copy, back to 0 after a beat.
export function useCopied(): [number, () => void] {
  const [copied, setCopied] = useState(0);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(0), SHOW_MS);
    return () => clearTimeout(timer);
  }, [copied]);
  const mark = useCallback(() => setCopied((n) => n + 1), []);
  return [copied, mark];
}
