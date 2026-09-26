"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useRef } from "react";
import { LOCALES } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { inter } from "../hero/inter";
import { AmplioMark } from "./AmplioMark";
import { type HeaderLabels, HeaderMenu, NAV_ITEMS } from "./HeaderMenu";
import f from "../hero/frame.module.css";
import s from "./header.module.css";
import { useHeaderState } from "./useHeaderState";

// The public pages are prerendered per locale and reached through the proxy's
// rewrite, so the router can report /en/pricing for what the browser shows as
// /pricing. The header only cares about the latter.
const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`);

const at = (x: number, y: number, sx?: number) => ({ "--x": x, "--y": y, ...(sx ? { "--sx": sx } : {}) }) as CSSProperties;

// The public site's header (docs/design/PAGES.md, "v3 — the glass hero"): measured in
// the hero's units, transparent over the landing's plate and frosted
// everywhere else. `data-hx` marks what the landing's entrance animates.
export function PublicHeader({ labels }: { labels: HeaderLabels }) {
  const pathname = usePathname().replace(LOCALE_PREFIX, "") || "/";
  const landing = pathname === "/";
  const header = useRef<HTMLElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const { solid, open, toggle, close } = useHeaderState({ landing, header, burger, pathname });
  const current = NAV_ITEMS.findIndex((i) => pathname.startsWith(i.href));

  return (
    <>
      <header ref={header} className={cn(f.frame, inter.variable, s.header)} data-solid={solid ? "" : undefined}>
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
      {landing ? null : <div className={cn(f.frame, s.spacer)} aria-hidden="true" />}
    </>
  );
}

