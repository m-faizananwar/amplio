import { Check, Clock } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Silhouette } from "@/components/Silhouette";
import { formatCount } from "@/lib/money";
import s from "./inside.module.css";

type Face = { name: string; avatarUrl: string | null };

// A collaboration review from the demo workspace, drawn as the product shows
// it: the brief, three demo creators, the live counts (the hero's source),
// the tabs, and what came back. Labelled as demo data.
export async function InsideCard({ clicks, posts, faces }: { clicks: number; posts: number; faces: Face[] }) {
  const [t, locale] = await Promise.all([getTranslations("landing.inside.card"), getLocale()]);
  const n = formatCount(clicks, locale);
  const tabs = t.raw("tabs") as string[];
  return (
    <figure className={s.card} aria-label={t("label")}>
      <p className={s.eyebrow}>{t("eyebrow")}</p>
      <p className={s.title}>{t("title")}</p>
      <div className={s.meta}>
        <span className={s.avatars} aria-hidden="true">
          {faces.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element -- demo creators' seeded avatars (an external generator); next/image would need its host allow-listed
            <span key={f.name}>{f.avatarUrl ? <img src={f.avatarUrl} alt="" loading="lazy" /> : <Silhouette />}</span>
          ))}
        </span>
        <Clock className={s.clock} aria-hidden="true" />
        <span>{t("meta", { posts, clicks: n })}</span>
      </div>
      <div className={s.tabs} aria-hidden="true">
        {tabs.map((tab, i) => <span key={tab} className={s.tab} data-active={i === 0 ? "" : undefined}>{tab}</span>)}
      </div>
      <div className={s.panel}>
        <p className={s.panelTitle}>{t("panel")}</p>
        <p className={s.row}><span className={s.check}><Check aria-hidden="true" /></span><b>{t("row1", { clicks: n, posts })}</b><span>{t("owner1")}</span></p>
        <p className={s.row}><span className={s.amber} aria-hidden="true" /><b>{t("row2", { name: faces[0]?.name ?? "—" })}</b><span>{t("owner2")}</span></p>
      </div>
      <figcaption className={s.note}>{t("note")}</figcaption>
    </figure>
  );
}
