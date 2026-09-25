import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { PublicTrail } from "../../constants";
import { HeroCounts } from "./HeroCounts";
import { TrailCanvas } from "./trail/TrailCanvas";
import { WordReveal } from "./WordReveal";

// The launch: the one line in big type, the one sentence, two ways in, the
// real counts as a ledger row — and the live trail acting it out (right half
// on desktop, its own band under the text on phones).
export async function LaunchHero({ trail }: { trail: PublicTrail | null }) {
  const t = await getTranslations("landing.hero");
  const counts = trail ?? { posts: 3, links: 3, clicks: 0, signups: 0 };
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden border-b border-rule lg:block">
      <TrailCanvas
        counts={counts}
        labels={{ posts: t("trail.posts"), site: t("trail.site"), ledger: t("trail.ledger") }}
        className="relative order-2 h-[40svh] w-full cursor-crosshair lg:absolute lg:inset-0 lg:h-auto"
      />
      <div className="relative order-1 mx-auto w-full max-w-content px-4 pt-24 sm:px-8 lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center lg:pb-28 lg:pt-20">
        <div className="max-w-[42rem]">
          <p className="text-small text-ink-muted">{t("eyebrow")}</p>
          <WordReveal as="h1" text={t("title")} className="mt-4 text-[clamp(52px,8.2vw,112px)] font-semibold leading-[0.92] tracking-[-0.045em]" stepMs={70} />
          <p className="mt-6 max-w-[34rem] text-lead text-ink-muted sm:text-h4 sm:font-normal sm:leading-snug sm:tracking-normal">{t("sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register/brand" className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-lead")}>{t("primary")}</Link>
            <Link href="/register/creator" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-12 px-6 text-lead")}>{t("secondary")}</Link>
          </div>
        </div>
        <div className="mt-10 max-w-[40rem] lg:mt-12">
          <HeroCounts trail={trail} />
          <p className="mt-1 hidden text-caption text-ink-muted lg:block">{t("tapHint")}</p>
        </div>
      </div>
      <div className="order-3 px-4 pb-24 lg:hidden" />
    </section>
  );
}
