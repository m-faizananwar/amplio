"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Ref } from "react";
import s from "./icp.module.css";

type Props = { n: number; title: string; description: string; invalid: boolean; onOpen: () => void; ref?: Ref<HTMLButtonElement> };

// One ideal customer at a glance: its number, who they are (two lines at
// most), what they care about (three), and Edit. The whole card opens the
// dialog.
export function IcpCard({ n, title, description, invalid, onOpen, ref }: Props) {
  const t = useTranslations("settings.brand.idealCustomers");
  return (
    <button ref={ref} type="button" className={s.card} data-invalid={invalid ? "" : undefined} onClick={onOpen} aria-label={t("card.open", { n, name: title || t("card.notSet") })} aria-haspopup="dialog">
      <span className={s.disc} aria-hidden="true">{n}</span>
      <span className={title ? s.who : `${s.who} ${s.muted}`}>{title || t("card.notSet")}</span>
      <span className={s.cares}>{description || t("details.placeholder")}</span>
      <span className={s.foot}>
        {invalid ? <span className={s.bad}>{t("card.hasError")}</span> : <span />}
        <span className={s.edit}><Pencil className="size-3.5" aria-hidden="true" />{t("card.edit")}</span>
      </span>
    </button>
  );
}
