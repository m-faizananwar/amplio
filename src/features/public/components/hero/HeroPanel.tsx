import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";
import { AmplioMark } from "../nav/AmplioMark";
import s from "./hero.module.css";

const FLOOR_PCT = 12;
const PCT = 100;

type Figures = { posts: string; links: string; clicks: string; signups: string };

// The glass panel: the demo workspace's own counts, live (re-read once a
// minute), with the share of clicks that became sign-ups as a track. The
// fill is floored at 12% so a small share still shows.
export async function HeroPanel({ figures, rate }: { figures: Figures | null; rate: number | null }) {
  const t = await getTranslations("landing.glass");
  const fill = rate === null ? FLOOR_PCT : Math.max(FLOOR_PCT, Math.min(PCT, rate));
  const keys = ["posts", "links", "clicks", "signups"] as const;
  return (
    <aside className={cn(s.panel, s.l, s.c, s.r)} style={{ "--x": 58, "--y": -165 } as CSSProperties} data-hx="panel" aria-label={t("dataNote")}>
      <p className={s.title} style={{ "--sx": 0.8707 } as CSSProperties}>{t("live")}</p>
      <span className={s.dot} data-hx="dot" aria-hidden="true" />
      <span className={s.badge} data-hx="badge" aria-hidden="true"><AmplioMark /></span>
      <p className={s.sub}>{t.rich("sub", { br: () => <br /> })}</p>
      <ul className={s.scale}>
        {keys.map((key) => (
          <li key={key}><b>{figures ? figures[key] : "—"}</b><span>{t(`figures.${key}`)}</span></li>
        ))}
      </ul>
      <div className={s.track} role="img" aria-label={t("rate", { rate: Math.round(rate ?? 0) })}>
        <i data-hx="track" style={{ width: `${fill}%` }} />
      </div>
      <p className={s.caption}>{t("dataNote")}</p>
    </aside>
  );
}
