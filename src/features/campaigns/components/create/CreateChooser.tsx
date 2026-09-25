import { Link2, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

import { BRAND } from "@/config/brand";
const OPTIONS = [
  {
    icon: Sparkles,
    title: "Create with AI",
    body: "AI asks the right questions and prepares a fully editable brief.",
    meta: "5 min",
    example: "I want to reach VP Sales in B2B SaaS in France.",
    cta: "Create with AI →",
    href: "/brand/campaigns/new/ai",
    variant: "default" as const,
  },
  {
    icon: Link2,
    title: "Start from your link",
    body: `Paste an influence campaign you already ran: ${BRAND.name} reuses the brief and structure.`,
    meta: "1 min",
    example: "Brief link (Notion, Docs, PDF…) → Brief recovered",
    cta: "Start from a link →",
    href: "/brand/campaigns/new/link",
    variant: "outline" as const,
  },
];

export function CreateChooser() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {OPTIONS.map((option) => (
        <article key={option.title} className="flex flex-col rounded-2xl border bg-background p-5">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
            <option.icon className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold leading-tight">{option.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{option.body}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{option.meta}</p>
          {option.example ? (
            <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground italic">“{option.example}”</p>
          ) : null}
          <span className="flex-1" aria-hidden="true" />
          <Link href={option.href} className={buttonVariants({ variant: option.variant, className: "mt-5 self-start" })}>
            {option.cta}
          </Link>
        </article>
      ))}
    </div>
  );
}
