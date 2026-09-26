import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SetupShell } from "@/components/flow/SetupShell";
import { agentModeOn } from "@/config/flags";
import { recommendPrice } from "@/lib/recommend-price";
import type { SetupStepKey } from "@/lib/setup-steps";
import { ONBOARDING_STEPS } from "../../constants";
import type { OnboardingState } from "../../server/queries";
import { creatorProgress } from "../../server/setup-progress";
import { CardForm } from "../flow/CardForm";
import { LegalForm } from "../flow/LegalForm";
import { LinkedinForm } from "../flow/LinkedinForm";
import { PriceForm } from "../flow/PriceForm";
import { cardData, legalDefaults, startingPrice } from "../flow/step-defaults";
import s from "@/components/flow/setup.module.css";

type Step = "linkedin" | "card" | "price" | "legal";
const STEPS: Step[] = ["linkedin", "card", "price", "legal"];
const HREF: Record<Step, string> = { linkedin: ONBOARDING_STEPS.linkedin.path, card: ONBOARDING_STEPS.card.path, price: ONBOARDING_STEPS.price.path, legal: ONBOARDING_STEPS.professional.path };
const TITLE_NS: Record<Step, string> = { linkedin: "linkedin", card: "card", price: "price", legal: "legal" };

function isStep(v: string | undefined): v is Step {
  return !!v && (STEPS as string[]).includes(v);
}

// Creator setup inside the app: the four steps on the rail (the account is
// done), the asked-for step open (or the first unfinished one), each rendered
// by the onboarding form it always had, the card previewed beside it.
export async function CreatorSetupView({ state, step }: { state: OnboardingState; step?: string }) {
  const t = await getTranslations("onboarding");
  const progress = creatorProgress(state, null);
  const next = progress.next && progress.next !== "account" ? progress.next : "card";
  const current: Step = isStep(step) ? step : isStep(next) ? next : "card";
  const done = (k: SetupStepKey) => progress.steps.find((x) => x.key === k)?.done ?? false;
  const tabs = [
    { key: "account", title: t("setup.steps.account.title"), href: null, done: true },
    ...STEPS.map((k) => ({ key: k, title: t(`setup.steps.${k}.title`), href: HREF[k], done: done(k) })),
  ];
  const card = cardData(state);
  const recommended = recommendPrice(state.followers, state.industries, state.engagementRate);
  const forms: Record<Step, React.ReactNode> = {
    linkedin: <LinkedinForm linkedinUrl={state.linkedinUrl} alreadyRead={state.profileRead} card={card} />,
    card: <CardForm state={state} back={HREF.linkedin} />,
    price: <PriceForm priceCents={startingPrice(state, recommended)} bundles={state.bundles} recommendedCents={recommended} card={card} back={HREF.card} />,
    // by this step the price is saved, the €20 floor included, so the card shows it
    legal: <LegalForm defaults={legalDefaults(state)} card={{ ...card, priceCents: state.priceCents }} back={HREF.price} />,
  };
  const foot = (
    <>
      {current === "linkedin" ? <Link href={HREF.card} className={s.skip}>{t("setup.skip")}</Link> : null}
      {current === "legal" && agentModeOn() ? (
        <p className={s.agent}>{t("setup.agent.creator")} <Link href="/creator/agent">{t("setup.agent.link")}</Link></p>
      ) : null}
    </>
  );
  return (
    <SetupShell
      name={t("setup.creatorTitle")}
      stepOf={t("setup.stepOf", { current: tabs.findIndex((x) => x.key === current) + 1, total: tabs.length })}
      title={t(`creator.${TITLE_NS[current]}.title`)}
      sub={t(`creator.${TITLE_NS[current]}.sub`)}
      railLabel={t("setup.railLabel")}
      doneLabel={t("setup.done")}
      tabs={tabs}
      current={current}
      foot={foot}
    >
      {forms[current]}
    </SetupShell>
  );
}
