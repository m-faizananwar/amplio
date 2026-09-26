import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { PublicCreator, PublicTrail } from "../../constants";
import { inter } from "../hero/inter";
import { BandTrail } from "./BandTrail";
import { InsideCard } from "./InsideCard";
import { InsideReveal } from "./InsideReveal";
import s from "./inside.module.css";

// Right after the hero: the product itself. A two-line headline wiping in, one
// line and the way into the demo, then the green band with the trail drifting
// across it and a collaboration review from the demo workspace on its edge.
export async function InsideAmplio({ trail, creators }: { trail: PublicTrail | null; creators: PublicCreator[] }) {
  const t = await getTranslations("landing.inside");
  const faces = creators.slice(0, 3).map((c) => ({ name: c.name.split(" ")[0], avatarUrl: c.avatarUrl }));
  return (
    <InsideReveal className={`${s.section} ${inter.variable}`}>
      <div className={s.head}>
        <h2 className={s.h2}><span>{t("line1")}</span><span>{t("line2")}</span></h2>
        <p className={s.sub}>{t("sub")}</p>
        <Link href="/login" className={s.cta}>{t("cta")}</Link>
      </div>
      <div className={s.stage}>
        <div className={s.band}><BandTrail /></div>
        <div className={s.cardWrap}>
          <InsideCard clicks={trail?.clicks ?? 0} posts={trail?.posts ?? 0} faces={faces} />
        </div>
      </div>
    </InsideReveal>
  );
}
