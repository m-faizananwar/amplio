"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import s from "./theme-switch.module.css";
import { useTheme } from "./useTheme";

// A visible light / dark switch: a round button whose sun retracts its rays
// and becomes the moon. Pressed = dark. Picks light or dark (the account
// menu still offers "system").
export function ThemeSwitch({ className }: { className?: string }) {
  const t = useTranslations("common.theme");
  const { resolved, choose } = useTheme();
  // useId can hold characters url(#…) won't take
  const mask = `sun-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      className={className ? `${s.switch} ${className}` : s.switch}
      aria-pressed={dark}
      aria-label={dark ? t("toLight") : t("toDark")}
      onClick={() => choose(dark ? "light" : "dark")}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <mask id={mask}>
          <rect width="24" height="24" fill="white" />
          <circle className={s.bite} cx="12" cy="12" r="7" fill="black" />
        </mask>
        <g className={s.rays} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" />
        </g>
        <circle className={s.disc} cx="12" cy="12" r="7.5" fill="currentColor" mask={`url(#${mask})`} />
      </svg>
    </button>
  );
}
