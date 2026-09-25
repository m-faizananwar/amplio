"use client";

import { DatabaseZap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { isActive, navFor } from "@/components/shell/nav";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "./PageHeader";

// Rendered by the app layouts instead of the page when DATABASE_URL is unset,
// so every tab still has its header and an honest state — never a 500.
export function DatabaseNotConfigured() {
  const pathname = usePathname();
  const role = pathname.startsWith("/creator") ? "creator" : "brand";
  const t = useTranslations(`shell.nav.${role}`);
  const nav = navFor(role);
  const current = [...nav.primary, nav.settings].find((item) => isActive(pathname, item.href, `/${role}`));
  return (
    <>
      <PageHeader title={current ? t(current.key) : "Workspace"} description="This screen needs the database." />
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-background px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <DatabaseZap className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Database not configured</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          This deployment has no <code className="rounded bg-muted px-1">DATABASE_URL</code>, so there are no rows to show.
          Set it, run the migration and seed, and this screen fills in. The navigation works in the meantime.
        </p>
        <Link href="/api/health" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
          Check /api/health
        </Link>
      </div>
    </>
  );
}
