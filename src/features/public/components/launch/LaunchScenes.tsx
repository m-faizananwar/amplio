import { getTranslations } from "next-intl/server";
import type { PublicTrail } from "../../constants";
import { Scene } from "./Scene";
import { AudienceVisual } from "./visuals/AudienceVisual";
import { ClicksVisual } from "./visuals/ClicksVisual";
import { LedgerVisual } from "./visuals/LedgerVisual";
import { PostVisual } from "./visuals/PostVisual";
import { ProofVisual } from "./visuals/ProofVisual";
import { SignupsVisual } from "./visuals/SignupsVisual";

type Props = { trail: PublicTrail | null; creators: string[] };

// The story, one idea per screen: post → audience → clicks → sign-ups →
// named rows → the bill next to the proof (the one ink beat).
export async function LaunchScenes({ trail, creators }: Props) {
  const t = await getTranslations("landing");
  const tr = trail ?? { posts: 0, links: 0, clicks: 0, signups: 0, paidPosts: 0, paidCents: 0, lastClickAt: null, asOf: "" };
  const names = creators.length ? creators : ["Aya", "Eric", "Nada"];
  const live = t("hero.liveLabel");
  const scene = (key: string) => ({ kicker: t(`scenes.${key}.kicker`), title: t(`scenes.${key}.title`), body: t(`scenes.${key}.body`) });
  const bare = (key: string, count: number) => t(key, { count }).replace(/^[\d,]+\s/, "");
  return (
    <>
      <Scene {...scene("post")} visual={<PostVisual creator={names[0]} linkLabel="amplio.link/r/k3x9" />} />
      <Scene {...scene("audience")} flip visual={<AudienceVisual />} />
      <Scene {...scene("clicks")} visual={<ClicksVisual clicks={tr.clicks} label={bare("hero.counts.clicks", tr.clicks)} liveLabel={live} rowLabel={bare("hero.counts.clicks", 1)} />} />
      <Scene {...scene("signups")} flip visual={<SignupsVisual signups={tr.signups} label={bare("hero.counts.signups", tr.signups)} liveLabel={live} />} />
      <Scene
        {...scene("ledger")}
        visual={<LedgerVisual rows={names.slice(0, 3).map((creator) => t("scenes.ledger.rowLabel", { creator }))} paidRow={t("scenes.proof.billLine", { amount: `€${Math.round(tr.paidCents / Math.max(tr.paidPosts, 1) / 100)}` })} stamp={t("scenes.ledger.stampPaid")} />}
      />
      <Scene
        {...scene("proof")}
        ink
        flip
        visual={
          <ProofVisual
            billTitle={t("scenes.proof.billTitle")}
            proofTitle={t("scenes.proof.proofTitle")}
            billLine={t("scenes.proof.billLine", { amount: "" }).trim()}
            paidCents={tr.paidCents}
            clicks={tr.clicks}
            signups={tr.signups}
            clicksLine={bare("scenes.proof.proofClicks", tr.clicks)}
            signupsLine={bare("scenes.proof.proofSignups", tr.signups)}
            liveLabel={live}
          />
        }
      />
    </>
  );
}
