import { cn } from "@/lib/cn";

// lucide-react no longer ships brand icons; naano's "in" badge is just this.
export function LinkedInMark({ className, label = "LinkedIn" }: { className?: string; label?: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-flex size-4 items-center justify-center rounded-[3px] bg-linkedin font-sans text-[0.6rem] font-bold leading-none text-brand-foreground", className)}
    >
      in
    </span>
  );
}
