import { cn } from "@/lib/cn";
import { CountUp } from "@/components/motion/CountUp";

const STRONG = 80;
const GOOD = 60;

export function FitPill({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= STRONG
      ? "bg-brand/10 text-brand"
      : score >= GOOD
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", tone, className)} title="Fit with the selected campaign">
      <CountUp value={score} format="percent" /> fit
    </span>
  );
}
