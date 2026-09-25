import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";

type Props = { title?: string; body?: string; retryHref?: string };

// Shown when a query fails. The real error is logged server-side; this only
// tells the user what to do next.
export async function ErrorState({ title, body, retryHref }: Props) {
  const t = await getTranslations("common");
  return (
    <div role="alert" className="flex flex-col items-center rounded-card border border-failure/30 bg-failure-soft px-6 py-14 text-center animate-rise">
      <span className="grid size-10 place-items-center rounded-full bg-surface text-failure" aria-hidden="true">
        <AlertTriangle className="size-4.5" />
      </span>
      <h2 className="mt-4 text-lead">{title ?? t("states.errorTitle")}</h2>
      <p className="mt-1 max-w-md text-body text-ink-muted">{body ?? t("states.errorBody")}</p>
      {retryHref ? <Link href={retryHref} className={buttonVariants({ variant: "secondary", className: "mt-6" })}>{t("actions.retry")}</Link> : null}
    </div>
  );
}
