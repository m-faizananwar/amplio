import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// The small white "UI" card inside each how-it-works step.
export function MockFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full max-w-[13.5rem] rounded-xl bg-card p-3 text-left shadow-md ring-1 ring-border/70", className)}>{children}</div>;
}
