import { cn } from "@/lib/cn";
import styles from "./glass.module.css";

// Two decorative vertical rules (≥768px): end segment, +, mid segment, +, end segment.
function Rule({ side }: { side: "left" | "right" }) {
  return (
    <div className={cn(styles.rule, side === "left" ? styles.ruleLeft : styles.ruleRight)} aria-hidden="true">
      <span className={cn(styles.seg, styles.segEnd)} /><span className={styles.plus}>+</span>
      <span className={cn(styles.seg, styles.segMid)} /><span className={styles.plus}>+</span>
      <span className={cn(styles.seg, styles.segEnd)} />
    </div>
  );
}

export function HeroRules() {
  return (
    <>
      <Rule side="left" />
      <Rule side="right" />
    </>
  );
}
