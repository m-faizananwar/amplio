import { cn } from "@/lib/cn";
import { BRAND } from "@/config/brand";
import { BrandMark } from "./BrandMark";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { mark: number; text: string }> = {
  sm: { mark: 20, text: "text-[1.0625rem]" },
  md: { mark: 24, text: "text-[1.25rem]" },
  lg: { mark: 32, text: "text-[1.75rem]" },
};

type Props = { size?: Size; className?: string; wordClassName?: string; markClassName?: string };

// The mark + "Amplio" in the product sans at 600, tight tracking
// (docs/design/DIRECTION.md: Geist 600 — the wordmark follows whatever the
// tokens load as the sans, so it becomes Geist with them, no second face).
export function BrandLockup({ size = "md", className, wordClassName, markClassName }: Props) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-[0.4em] leading-none", s.text, className)}>
      <BrandMark size={s.mark} className={markClassName} />
      <span className={cn("font-sans font-semibold tracking-[-0.02em]", wordClassName)}>{BRAND.wordmark}</span>
    </span>
  );
}
