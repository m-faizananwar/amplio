"use client";

import { useTranslations } from "next-intl";
import type { BriefAngleDoc } from "@/lib/brief-markdown";

export function BriefAngleCard({ index, angle }: { index: number; angle: BriefAngleDoc }) {
  const t = useTranslations("collaboration.briefDrawer.angle");
  return (
    <article className="grid gap-2 rounded-control border border-rule bg-paper p-4">
      <h4 className="flex items-center gap-2 font-medium">
        <span aria-hidden="true" className="num grid size-5 place-items-center rounded-chip bg-ink text-caption text-paper">{index}</span>
        {angle.angle}
      </h4>
      <dl className="grid gap-2 text-small">
        <div><dt className="text-ink-muted">{t("hook")}</dt><dd>{angle.hook}</dd></div>
        <div><dt className="text-ink-muted">{t("direction")}</dt><dd>{angle.direction}</dd></div>
        <div><dt className="text-ink-muted">{t("example")}</dt><dd className="whitespace-pre-line rounded-control bg-surface p-3">{angle.example}</dd></div>
      </dl>
    </article>
  );
}
