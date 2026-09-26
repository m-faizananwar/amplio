"use client";

import { useEffect, useRef, useState } from "react";
import { posterOnly, runPlate } from "./plate-video";

// The plate's clip, over the poster. It fades in once it actually plays;
// until then (and on phones, Save-Data, small CPUs) the poster is the plate.
export function HeroVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v || posterOnly()) return;
    return runPlate(v);
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      data-on={on ? "" : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setOn(true)}
    />
  );
}
