import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/money";
import { LOW_WALLET_CENTS } from "../../constants";
import type { BrandOverview } from "../../server/overview-queries";

type Action = { title: string; body: string; href: string; tone: "Blocked" | "To do" | "Suggested" };

export function BrandPriorityActions({ overview, walletCents }: { overview: BrandOverview; walletCents: number }) {
  const actions: Action[] = [];
  if (walletCents < LOW_WALLET_CENTS) {
    actions.push({ title: "Top up your wallet", body: `${formatCents(walletCents, "EUR")} available — invitations are funded from it.`, href: "/brand/billing", tone: "Blocked" });
  }
  if (overview.draftsToReview > 0) {
    actions.push({ title: `Review ${overview.draftsToReview} draft${overview.draftsToReview > 1 ? "s" : ""}`, body: "Read the complete draft before approving or requesting changes.", href: "/brand/collaborations", tone: "To do" });
  }
  if (overview.applicationsReceived > 0) {
    actions.push({ title: `${overview.applicationsReceived} application${overview.applicationsReceived > 1 ? "s" : ""} received`, body: "Creators applied to your open campaign. Accept to create the booking.", href: "/brand/collaborations", tone: "To do" });
  }
  actions.push({ title: "Find new creators for your next campaign", body: "Ranked by sector fit first, verified performance second.", href: "/brand/creators", tone: "Suggested" });

  return (
    <section className="rounded-2xl border bg-background p-5">
      <h2 className="font-semibold">To do</h2>
      <p className="text-sm text-muted-foreground">Priority actions</p>
      <ul className="mt-4 grid gap-2">
        {actions.map((a) => (
          <li key={a.title}>
            <Link href={a.href} className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted">
              <span className="flex-1">
                <span className="block font-medium">{a.title}</span>
                <span className="block text-xs text-muted-foreground">{a.body}</span>
              </span>
              <Badge variant={a.tone === "Blocked" ? "destructive" : a.tone === "To do" ? "default" : "secondary"}>{a.tone}</Badge>
              <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
