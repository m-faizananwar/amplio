"use client";

import { useEffect } from "react";
import { startScrollMorph } from "@/lib/motion/scroll-morph";

// Mounts the section-rise observer once for the whole app.
export function ScrollMorph() {
  useEffect(() => startScrollMorph(), []);
  return null;
}
