import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// Only while the card can't be booked: says exactly what is missing.
export async function CardIncomplete({ missingPrice, missingIndustries }: { missingPrice: boolean; missingIndustries: boolean }) {
  if (!missingPrice && !missingIndustries) return null;
  const t = await getTranslations("creator.card.incomplete");
  return (
    <div role="status" className="flex flex-col gap-3 rounded-card border border-attention/40 bg-attention-soft p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-ink">{t("title")}</p>
        <p className="text-small text-ink-muted">
          {[missingPrice ? t("missingPrice") : null, missingIndustries ? t("missingIndustries") : null].filter(Boolean).join(" ")}
        </p>
      </div>
      <Link href={missingPrice ? "/creator/settings#pricing" : "/creator/settings#card"} className={buttonVariants({ variant: "secondary", size: "sm" })}>{t("action")}</Link>
    </div>
  );
}
