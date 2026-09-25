import { getLocale, getTranslations } from "next-intl/server";
import { formatWholeEuros } from "@/lib/money";
import type { PublicTrail } from "../../constants";
import { Scene } from "./Scene";
import { SceneRail } from "./SceneRail";
import { ClicksVisual } from "./visuals/ClicksVisual";
import { LedgerVisual } from "./visuals/LedgerVisual";
import { Stage } from "../stage/Stage";
import { ShareBurst } from "../stage/ShareBurst";
import { ClickField } from "../stage/ClickField";
import { SignupDrop } from "../stage/SignupDrop";
import { ProofVisual } from "./visuals/ProofVisual";
import { SignupsVisual } from "./visuals/SignupsVisual";

type Props = { trail: PublicTrail | null; creators: string[] };

const LINK = "amplio.link/r/k3x9";
const SCENES = ["post", "clicks", "signups", "ledger", "proof"] as const;

// The story in five beats, one idea per screen: a post goes out and its
// audience lights up → clicks → sign-ups → every row has a name → the bill
// joined to the proof (the one ink beat). A rail on the left keeps your place.
export async function LaunchScenes({ trail, creators }: Props) {
  const t = await getTranslations("landing");
  const tr = trail ?? { example: null, posts: 0, links: 0, clicks: 0, signups: 0, paidPosts: 0, paidCents: 0, lastClickAt: null, asOf: "" };
  const names = creators.length ? creators : ["Aya", "Eric", "Nada"];
  const live = t("hero.liveLabel");
  const bare = (key: string, count: number) => t(key, { count }).replace(/^[\d,  ]+/, "");
  const scene = (key: (typeof SCENES)[number]) => {
    const index = SCENES.indexOf(key);
    return { index, kicker: String(index + 1).padStart(2, "0"), title: t(`scenes.${key}.title`), body: t(`scenes.${key}.body`) };
  };
  // one real paid post's fee, not an average: the row says "for one published post"
  const perPost = formatWholeEuros(tr.example?.feeCents ?? 0, await getLocale());
  return (
    <div className="relative">
      <SceneRail count={SCENES.length} />
      <Scene {...scene("post")} visual={<Stage loop><ShareBurst name={names[0]} linkLabel={LINK} /></Stage>} />
      <Scene {...scene("clicks")} flip visual={<div className="grid gap-6"><Stage loop><ClickField linkLabel="/r/k3x9" /></Stage><ClicksVisual clicks={tr.clicks} label={bare("hero.counts.clicks", tr.clicks)} liveLabel={live} rowLabel={bare("hero.counts.clicks", 1)} link={LINK} /></div>} />
      <Scene {...scene("signups")} visual={<div className="grid gap-4"><Stage><SignupDrop rows={names.slice(0, 3).map((creator) => t("scenes.ledger.rowLabel", { creator }))} signUpLabel={bare("hero.counts.signups", 1)} /></Stage><SignupsVisual signups={tr.signups} label={bare("hero.counts.signups", tr.signups)} liveLabel={live} compact /></div>} />
      <Scene
        {...scene("ledger")}
        flip
        visual={<LedgerVisual rows={names.slice(0, 3).map((creator) => t("scenes.ledger.rowLabel", { creator }))} initials={names.map((n) => n.slice(0, 1))} paidRow={t("scenes.proof.billLine", { amount: perPost })} stamp={t("scenes.ledger.stampPaid")} />}
      />
      <Scene
        {...scene("proof")}
        ink
        visual={
          <Stage><ProofVisual
            billTitle={t("scenes.proof.billTitle")}
            proofTitle={t("scenes.proof.proofTitle")}
            billLine={t("hero.counts.posts", { count: tr.paidPosts })}
            paidCents={tr.paidCents}
            clicks={tr.clicks}
            signups={tr.signups}
            clicksLine={bare("scenes.proof.proofClicks", tr.clicks)}
            signupsLine={bare("scenes.proof.proofSignups", tr.signups)}
            liveLabel={live}
          /></Stage>
        }
      />
    </div>
  );
}
