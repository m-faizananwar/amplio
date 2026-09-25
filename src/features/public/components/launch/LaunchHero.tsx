import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { PublicTrail } from "../../constants";
import { HeroCounts } from "./HeroCounts";
import { TrailCanvas } from "./trail/TrailCanvas";
import { WordReveal } from "./WordReveal";

// The launch: the live trail across the page, the one line in big type, the
// one sentence under it, two ways in, and the real counts.
export async function LaunchHero({ trail }: { trail: PublicTrail | null }) {
  const t = await getTranslations("landing.hero");
  const counts = trail ?? { posts: 3, links: 3, clicks: 0, signups: 0 };
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden border-b border-rule">
      <TrailCanvas counts={counts} />
      <div className="relative mx-auto flex min-h-[100svh] max-w-content flex-col justify-start px-4 pb-16 pt-28 sm:px-8 lg:justify-center lg:pt-24">
        <div className="max-w-[40rem]">
          <p className="text-small text-ink-muted">{t("eyebrow")}</p>
          <WordReveal as="h1" text={t("title")} className="mt-4 text-[clamp(52px,9.5vw,120px)] font-semibold leading-[0.92] tracking-[-0.045em]" stepMs={70} />
          <p className="mt-6 max-w-[34rem] text-lead text-ink-muted sm:text-h4 sm:font-normal sm:leading-snug sm:tracking-normal">{t("sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register/brand" className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-lead")}>{t("primary")}</Link>
            <Link href="/register/creator" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-12 px-6 text-lead")}>{t("secondary")}</Link>
          </div>
          <div className="mt-10">
            <HeroCounts trail={trail} />
          </div>
        </div>
      </div>
    </section>
  );
}
