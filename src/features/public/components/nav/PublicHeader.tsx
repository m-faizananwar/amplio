"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useRef } from "react";
import { cn } from "@/lib/cn";
import { inter } from "../hero/inter";
import { AmplioMark } from "./AmplioMark";
import { type HeaderLabels, HeaderMenu, NAV_ITEMS } from "./HeaderMenu";
import s from "./header.module.css";
import { useHeaderState } from "./useHeaderState";
import "../hero/glass-frame.css";

const at = (x: number, y: number, sx?: number) => ({ "--x": x, "--y": y, ...(sx ? { "--sx": sx } : {}) }) as CSSProperties;

// The public site's header (docs/design/PAGES.md, "Glass hero"): measured in
// the hero's units, transparent over the landing's plate and frosted
// everywhere else. `data-hx` marks what the landing's entrance animates.
export function PublicHeader({ labels }: { labels: HeaderLabels }) {
  const pathname = usePathname();
  const landing = pathname === "/";
  const header = useRef<HTMLElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const { solid, open, toggle, close } = useHeaderState({ landing, header, burger, pathname });
  const current = NAV_ITEMS.findIndex((i) => pathname.startsWith(i.href));

  return (
    <>
      <header ref={header} className={cn("glass-frame", inter.variable, s.header)} data-solid={solid ? "" : undefined}>
        <Link href="/" aria-label={labels.home} className={cn(s.brand, s.l, s.t)} style={at(68, 47)} data-hx="brand">
          <AmplioMark ring className={s.mark} />
          <b className={s.sx} style={{ "--sx": 0.894 } as CSSProperties}>Amplio</b>
        </Link>
        <button
          ref={burger}
          type="button"
          className={s.burger}
          aria-expanded={open}
          aria-controls="public-menu"
          aria-label={open ? labels.closeMenu : labels.menu}
          data-open={open ? "" : undefined}
          data-hx="burger"
          onClick={toggle}
        >
          <i /><i />
        </button>
        <HeaderMenu labels={labels} open={open} current={current} close={close} />
      </header>
      {landing ? null : <div className={cn("glass-frame", s.spacer)} aria-hidden="true" />}
    </>
  );
}

