"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

type Props = { error: Error & { digest?: string }; reset: () => void; homeHref: string; scope: string };

// The render-error boundary's content for any app route: the cause goes to
// the console with its digest, the reader gets "try again" and a way home.
export function RouteError({ error, reset, homeHref, scope }: Props) {
  const t = useTranslations("shell.pageStates");
  const tc = useTranslations("common.actions");
  useEffect(() => {
    console.error(`[${scope}] render error`, error.digest ?? error.message);
  }, [error, scope]);
  return (
    <div role="alert" className="flex flex-col items-center rounded-card border border-failure/30 bg-failure-soft px-6 py-14 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-surface text-failure" aria-hidden="true"><AlertTriangle className="size-4.5" /></span>
      <h2 className="mt-4 text-lead">{t("pageErrorTitle")}</h2>
      <p className="mt-1 max-w-md text-body text-ink-muted">{t("pageErrorBody")}</p>
      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={reset}>{tc("retry")}</Button>
        <Link href={homeHref} className={buttonVariants({ variant: "ghost" })}>{t("backToOverview")}</Link>
      </div>
    </div>
  );
}
