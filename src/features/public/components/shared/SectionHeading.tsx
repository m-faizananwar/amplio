import { cn } from "@/lib/cn";

type Props = { eyebrow?: string; title: string; sub?: string; align?: "center" | "left"; className?: string };

export function SectionHeading({ eyebrow, title, sub, align = "center", className }: Props) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {eyebrow ? (
        <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl">{title}</h2>
      {sub ? <p className="mt-4 text-lg text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
