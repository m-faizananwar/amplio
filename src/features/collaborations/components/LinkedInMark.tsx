import { cn } from "@/lib/cn";

// lucide dropped brand icons; the "in" square is all the cards need.
export function LinkedInMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex size-4 items-center justify-center rounded-[3px] bg-brand text-[0.55rem] font-bold leading-none text-brand-foreground", className)}
    >
      in
    </span>
  );
}
