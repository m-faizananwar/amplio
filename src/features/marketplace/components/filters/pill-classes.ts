import { cn } from "@/lib/cn";

// Every filter trigger looks the same; an active one carries an ink border.
export const pillClass = (active: boolean) => cn("h-8 gap-1.5 px-3 text-small", active && "border-ink bg-tint");
