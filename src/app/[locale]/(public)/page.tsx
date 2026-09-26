import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GlassHero } from "@/features/public/components/hero/GlassHero";
import { LaunchClosing } from "@/features/public/components/launch/LaunchClosing";
import { LaunchScenes } from "@/features/public/components/launch/LaunchScenes";
import { getShowcaseCreators } from "@/features/public/server/queries";
import { getPublicTrail } from "@/features/public/server/trail-queries";
import { enterLocale, type LocaleParams } from "@/i18n/segment";
import "@/features/public/components/launch/launch.css";

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const locale = await enterLocale(props);
  const t = await getTranslations({ locale, namespace: "landing.meta" });
  return { title: t("title"), description: t("description") };
}

// Static per locale, re-read at most once a minute: the trail counts are the
// demo workspace's, and a minute behind is fine for the landing. A missing
// database degrades to the static drawing (the queries catch it).
export const revalidate = 60;

export default async function HomePage(props: LocaleParams) {
  await enterLocale(props);
  const [trail, creators] = await Promise.all([getPublicTrail(), getShowcaseCreators()]);
  const names = creators.map((c) => c.name.split(" ")[0]).slice(0, 3);
  return (
    <>
      <GlassHero trail={trail} />
      <LaunchScenes trail={trail} creators={names} />
      <LaunchClosing trail={trail} />
    </>
  );
}
