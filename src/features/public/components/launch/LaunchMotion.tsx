"use client";

import { useEffect } from "react";

// Hidden-until-revealed states in launch.css only apply under html.launch-js,
// so without JS (and before hydration) every word and scene is visible.
export function LaunchMotion() {
  useEffect(() => {
    document.documentElement.classList.add("launch-js");
    return () => document.documentElement.classList.remove("launch-js");
  }, []);
  return null;
}
