import { cn } from "@/lib/cn";

// naano's "in" square next to every creator.
export function LinkedInBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex size-5 items-center justify-center rounded-[4px] bg-sky-700 text-[10px] font-bold leading-none text-white", className)}
      aria-label="LinkedIn creator"
      title="LinkedIn creator"
    >
      in
    </span>
  );
}
