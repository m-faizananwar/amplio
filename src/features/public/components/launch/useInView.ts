"use client";

import { type RefObject, useEffect, useState } from "react";

// true once the element is `amount` into the viewport; with `repeat`, false
// again when it leaves (so a scene replays on the way back).
export function useInView(ref: RefObject<Element | null>, options: { amount?: number; repeat?: boolean } = {}) {
  const { amount = 0.35, repeat = false } = options;
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
        else if (repeat) setInView(false);
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, repeat]);
  return inView;
}
