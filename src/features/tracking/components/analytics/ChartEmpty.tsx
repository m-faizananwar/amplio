import Link from "next/link";
import { useTranslations } from "next-intl";
import { BlankBriefScene } from "@/components/graphics/scenes";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

// What the chart says when there is nothing to draw: no posts means the
// profile hasn't been read (fix it in Settings); no clicks is just quiet.
export function ChartEmpty({ postBased }: { postBased: boolean }) {
  const t = useTranslations("creator.analytics");
  if (!postBased) return <p className="py-10 text-center text-small text-ink-muted">{t("chart.empty")}</p>;
  return (
    <EmptyState size="compact" illustration={<BlankBriefScene />} title={t("empty.noPosts.title")} body={t("empty.noPosts.body")}
      action={<Link href="/creator/settings#linkedin" className={buttonVariants({ variant: "secondary" })}>{t("empty.noPosts.action")}</Link>} />
  );
}
