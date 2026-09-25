import Link from "next/link";
import { cn } from "@/lib/cn";
import { ChamferLink } from "../glass/ChamferLink";

type Props = { href: string; label: string; variant?: "primary" | "secondary" | "ghost" | "brand"; className?: string; arrow?: boolean };

// The public pages' CTAs in the landing's language: primary (and "brand") is
// the chamfer button with the arrow nudge; secondary/ghost is the glass
// capsule (the nav capsule's material, .btn-glass).
export function PillLink({ href, label, variant = "primary", className }: Props) {
  if (variant === "primary" || variant === "brand") return <ChamferLink href={href} label={label} className={cn("mt-0", className)} />;
  return (
    <Link
      href={href}
      className={cn(
        "btn-glass inline-flex h-12 items-center justify-center rounded-full text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
        variant === "ghost" ? "px-4" : "px-6",
        className,
      )}
    >
      {label}
    </Link>
  );
}
