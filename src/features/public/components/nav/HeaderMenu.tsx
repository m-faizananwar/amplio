"use client";

import Link from "next/link";
import { type CSSProperties, Fragment, useRef } from "react";
import { cn } from "@/lib/cn";
import { GlassIcon } from "./GlassIcon";
import s from "./header.module.css";
import { useNavCapsule } from "./useNavCapsule";

export type HeaderLabels = {
  home: string; main: string; forCreators: string; pricing: string;
  signIn: string; startFree: string; menu: string; closeMenu: string;
};

export const NAV_ITEMS = [
  { href: "/for-creators", key: "forCreators", icon: "people" },
  { href: "/pricing", key: "pricing", icon: "grid" },
] as const;

type Props = { labels: HeaderLabels; open: boolean; current: number; close: () => void };

// The nav pill (two items and the capsule), Sign in and Start free. Inline on
// landscape frames; on portrait ones the same markup is the burger's dropdown.
export function HeaderMenu({ labels, open, current, close }: Props) {
  const nav = useRef<HTMLElement>(null);
  const { capsule, moveTo, park } = useNavCapsule(nav, current);
  return (
    <div id="public-menu" className={s.menu} data-open={open ? "" : undefined}>
      <nav ref={nav} aria-label={labels.main} className={s.nav} data-hx="nav" onPointerLeave={park}>
        <span ref={capsule} className={s.capsule} aria-hidden="true" />
        {NAV_ITEMS.map((item, i) => (
          <Fragment key={item.href}>
            {i > 0 ? <hr className={s.divider} /> : null}
            <Link
              href={item.href}
              className={s.item}
              data-cap=""
              aria-current={i === current ? "page" : undefined}
              onPointerEnter={() => moveTo(i)}
              onFocus={() => moveTo(i)}
              onBlur={park}
              onClick={() => close()}
            >
              <GlassIcon name={item.icon} />
              <span>{labels[item.key]}</span>
            </Link>
          </Fragment>
        ))}
      </nav>
      <hr className={s.menuRule} />
      <Link href="/login" className={s.signin} onClick={() => close()}>{labels.signIn}</Link>
      <Link href="/register?role=brand" className={cn(s.cta, s.l, s.t, s.r)} style={{ "--x": 58, "--y": 30 } as CSSProperties} data-hx="cta" onClick={() => close()}>
        <span className={s.ctaLabel}>{labels.startFree}</span>
        <span className={s.knob}><GlassIcon name="chevron" /></span>
      </Link>
    </div>
  );
}
