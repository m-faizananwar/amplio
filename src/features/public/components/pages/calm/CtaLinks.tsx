import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string };

// The page's two ways in: one primary (ink), one secondary (outline).
export function CtaLinks({ primary, secondary }: { primary: Item; secondary?: Item }) {
  return (
    <>
      <Link href={primary.href} className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>{primary.label}</Link>
      {secondary ? <Link href={secondary.href} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-11 px-5")}>{secondary.label}</Link> : null}
    </>
  );
}
