"use client";

import { DatabaseZap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { isActive, navFor } from "@/components/shell/nav";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "./PageHeader";

// Rendered by the app layouts instead of the page when DATABASE_URL is unset,
// so every tab still has its header and an honest state — never a 500.
export function DatabaseNotConfigured() {
  const pathname = usePathname();
  const role = pathname.startsWith("/creator") ? "creator" : "brand";
  const t = useTranslations(`shell.nav.${role}`);
  const tp = useTranslations("shell.pageStates");
  const nav = navFor(role);
  const current = [...nav.primary, nav.settings].find((item) => isActive(pathname, item.href, `/${role}`));
  return (
    <>
      <PageHeader title={current ? t(current.key) : tp("dbTitle")} description={tp("dbDescription")} />
      <EmptyState icon={DatabaseZap} title={tp("dbTitle")} body={tp("dbBody")} action={<Link href="/api/health" className={buttonVariants({ variant: "secondary" })}>{tp("dbHealth")}</Link>} />
    </>
  );
}
