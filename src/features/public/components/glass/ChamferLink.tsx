import Link from "next/link";
import { cn } from "@/lib/cn";
import styles from "./glass.module.css";

import { HoverBeam } from "@/components/motion/HoverBeam";
// The spec's chamfered button: four stacked layers, corners cut top-left and
// bottom-right at 14px, frosted below 640px and a hairline outline above.
// vector-effect keeps the 1.5px stroke while preserveAspectRatio="none" stretches it.
export function ChamferLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <HoverBeam size="line" strength={0.5} className={styles.chamferBeam}>
    <Link href={href} className={cn(styles.chamfer, styles.glassFont, className)}>
      <span className={styles.chamferGlass} aria-hidden="true" />
      <svg className={styles.chamferOutline} viewBox="0 0 260 48" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="14,0 260,0 260,34 246,48 0,48 0,14" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={styles.chamferLabel}>{label}</span>
      <svg className={styles.chamferIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
      </svg>
    </Link>
    </HoverBeam>
  );
}
