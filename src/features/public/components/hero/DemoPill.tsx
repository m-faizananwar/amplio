import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { GlassIcon } from "../nav/GlassIcon";
import s from "./hero.module.css";

// "Open the demo": sign-in, where the one-click demo accounts are.
export function DemoPill({ label }: { label: string }) {
  return (
    <Link href="/login" className={cn(s.meet, s.l, s.b, s.r)} style={{ "--x": 59, "--y": 66 } as CSSProperties} data-hx="meet">
      <span className={s.thumb}>
        <picture>
          <source type="image/avif" srcSet="/media/hero-plate-800.avif" />
          <img src="/media/hero-plate-800.webp" alt="" width={800} height={446} loading="lazy" decoding="async" />
        </picture>
      </span>
      <b className={s.meetLabel}>{label}</b>
      <span className={s.knob}><GlassIcon name="chevron" /></span>
    </Link>
  );
}
