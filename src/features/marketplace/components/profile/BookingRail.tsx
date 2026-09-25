"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact, formatEuro, formatEuroWhole } from "@/lib/format-euro";
import type { CreatorDto } from "../../schemas";
import { BookButton } from "../cards/BookButton";
import { PricingPopover } from "./PricingPopover";

// Right rail of the profile modal: "Book this creator".
export function BookingRail({ creator }: { creator: CreatorDto }) {
  const rows = [
    { label: "Typical reach", value: formatCompact(creator.medianViews) },
    { label: "Estimated CPM", value: creator.cpmCents === null ? "—" : formatEuroWhole(creator.cpmCents) },
    { label: "Posts analyzed", value: String(creator.posts.length) },
  ];
  return (
    <aside className="rounded-2xl border bg-muted/30 p-4 lg:sticky lg:top-5" aria-label="Book this creator">
      <h3 className="font-semibold">Book this creator</h3>
      <ul className="mt-3 grid gap-2">
        <li className={cn("flex items-center justify-between rounded-lg border-2 border-brand bg-background px-3 py-2 text-sm")}>
          <span className="font-medium">Single post</span>
          <span className="font-semibold tabular-nums">{formatEuro(creator.priceCents)}</span>
        </li>
        {creator.bundle ? (
          <li className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
            <span className="font-medium">
              Bundle <span className="text-muted-foreground">· {creator.bundle.posts} posts</span>
            </span>
            <span className="font-semibold tabular-nums">{formatEuro(creator.bundle.totalCents)}</span>
          </li>
        ) : null}
      </ul>
      <dl className="mt-4 grid gap-1.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-medium tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex justify-end">
        <PricingPopover creator={creator} />
      </div>
      <BookButton creator={creator} size="lg" className="mt-4 w-full bg-brand text-brand-foreground hover:bg-brand/90" label={`Collaborate with ${creator.name.split(" ")[0]}`} />
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Secure booking · Creator approves first
      </p>
    </aside>
  );
}
