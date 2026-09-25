import { cn } from "@/lib/cn";

// One skeleton block: muted fill with the existing 1.6s shimmer sweep. Renders
// on the server; no motion library involved.
export function Bone({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("animate-shimmer rounded-md bg-muted", className)} {...props} />;
}
