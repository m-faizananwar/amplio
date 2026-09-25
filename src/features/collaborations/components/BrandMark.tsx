import { cn } from "@/lib/cn";
import { brandMarkFor } from "@/lib/avatar";

type Props = { initial: string; name: string; size?: "sm" | "md" | "lg"; className?: string };

const SIZES = { sm: "size-8 text-sm", md: "size-10 text-base", lg: "size-14 text-xl" } as const;

// The brand "logo": a shape mark seeded by the company name in a rounded
// square; the initial sits behind it and only shows if the image fails.
export function BrandMark({ initial, name, size = "md", className }: Props) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-foreground font-semibold text-background",
        SIZES[size],
        className,
      )}
    >
      {initial}
      {/* eslint-disable-next-line @next/next/no-img-element -- remote svg mark, no optimisation */}
      <img src={brandMarkFor(name)} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
    </span>
  );
}
