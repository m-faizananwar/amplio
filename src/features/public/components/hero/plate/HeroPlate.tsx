import { preload } from "react-dom";
import { cn } from "@/lib/cn";
import { HeroVideo } from "./HeroVideo";
import s from "../hero.module.css";

const AVIF = "/media/hero-plate-800.avif 800w, /media/hero-plate-1600.avif 1600w";
const WEBP = "/media/hero-plate-800.webp 800w, /media/hero-plate-1600.webp 1600w";

// The background plate: a glass sphere cut by a glass blade on a pale studio
// backdrop. The poster paints first and is the page's LCP; the clip fades in
// over it once it plays (HeroVideo decides whether it ever does).
export function HeroPlate() {
  preload("/media/hero-plate-1600.avif", { as: "image", type: "image/avif", imageSrcSet: AVIF, imageSizes: "100vw", fetchPriority: "high" });
  return (
    <>
      <picture>
        <source type="image/avif" srcSet={AVIF} sizes="100vw" />
        <source type="image/webp" srcSet={WEBP} sizes="100vw" />
        <img className={s.bg} src="/media/hero-plate-1600.webp" alt="" width={1600} height={893} fetchPriority="high" />
      </picture>
      <HeroVideo className={cn(s.bg, s.video)} />
      <div className={s.tint} />
    </>
  );
}
