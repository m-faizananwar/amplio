"use client";

import type { ComponentProps } from "react";

import { TabsList } from "@/components/ui/tabs";
import { SlidingIndicator } from "./SlidingIndicator";

// The shadcn tab list with the app's sliding chip: same props, same look, but
// the active background (or underline, for variant="line") is one element that
// moves instead of a class that jumps. Keeps the primitive untouched —
// src/components/ui is generated output.
export function SlideTabsList({ className, variant = "default", ...props }: ComponentProps<typeof TabsList>) {
  return (
    <SlidingIndicator variant={variant === "line" ? "underline" : "pill"} className="w-fit max-w-full">
      <TabsList className={className} variant={variant} {...props} />
    </SlidingIndicator>
  );
}
