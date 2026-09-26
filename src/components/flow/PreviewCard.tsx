"use client";

import { RefreshCw } from "lucide-react";
import { type CSSProperties, type ReactNode, type Ref, useEffect, useRef, useState } from "react";
import { usePointerTilt } from "./usePointerTilt";
import s from "./wizard.module.css";

const FLIP_AFTER_MS = 280;
const WIDE = "(min-width: 1024px)";
const PCT = 100;

// figures (counts, amounts) take the number face; words don't
const isFigure = (v: ReactNode) => typeof v === "number" || (typeof v === "string" && /^[\d\s.,€$£%\u00a0\u202f—-]+$/.test(v));

export type PreviewStat = { label: string; value: ReactNode; ref?: Ref<HTMLSpanElement> };
export type PreviewFact = { label: string; value: string };

type Props = {
  label: string;
  bandLabel: string;
  bandStart?: ReactNode;
  name: string;
  namePlaceholder: string;
  progress: number;
  progressLabel: string;
  stats: PreviewStat[];
  facts: PreviewFact[];
  factsTitle: string;
  // a step that adds details shows the back (the facts) once it arrives
  showBack?: boolean;
  flipLabels: { toBack: string; toFront: string };
  children?: ReactNode;
};

// The wizard's preview card: the thing being made (a creator's card, a
// brand's profile). A tinted band, the name large (placeholder until typed),
// a progress track, the step's own content and a stats strip on the front;
// the entered facts as rows on the back. Tilts toward the pointer; flips
// on its own when a step adds details, and on the flip button.
export function PreviewCard(props: Props) {
  const { label, bandLabel, bandStart, name, namePlaceholder, progress, progressLabel, stats, facts, factsTitle, showBack = false, flipLabels, children } = props;
  const tilt = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<"front" | "back">("front");
  usePointerTilt(tilt);
  // arriving on a step that adds details: show the front a beat, then turn it
  // over. Phones stack the card above the fields, so there it stays on its
  // (shorter) front and the details are one tap away.
  useEffect(() => {
    const wide = window.matchMedia(WIDE).matches;
    const timer = window.setTimeout(() => setSide(showBack && wide ? "back" : "front"), FLIP_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [showBack]);
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * PCT);
  const flip = (to: "front" | "back") => (
    <button type="button" className={s.flip} onClick={() => setSide(to)}>
      <RefreshCw className="size-3.5" aria-hidden="true" />{to === "back" ? flipLabels.toBack : flipLabels.toFront}
    </button>
  );
  return (
    <div className={s.stage}>
      <div ref={tilt} className={s.tilt}>
        <div className={s.flipper} data-side={side}>
          <figure className={s.face} aria-label={label} aria-hidden={side === "back"} inert={side === "back"}>
            <div className={s.band}>{bandStart}<span className={s.bandLabel}>{bandLabel}</span></div>
            <div className={s.body}>
              <p className={s.name} data-empty={name ? undefined : ""}>{name || namePlaceholder}</p>
              <div className={s.track} role="progressbar" aria-label={progressLabel} aria-valuemin={0} aria-valuemax={PCT} aria-valuenow={pct}>
                <span className={s.fill} style={{ "--progress": `${pct}%` } as CSSProperties} />
              </div>
              {children ? <div className={s.content}>{children}</div> : null}
            </div>
            <div className={s.stats}>
              {stats.map((st) => (
                <div key={st.label} className={s.stat}>
                  <span className={s.statLabel}>{st.label}</span>
                  <span ref={st.ref} className={isFigure(st.value) ? `${s.statValue} num` : s.statValue}>{st.value}</span>
                </div>
              ))}
            </div>
            {facts.length ? flip("back") : null}
          </figure>
          <div className={`${s.face} ${s.back}`} aria-hidden={side === "front"} inert={side === "front"}>
            <div className={s.band}><span className={s.bandLabel}>{factsTitle}</span></div>
            <dl className={s.facts}>
              {facts.map((f) => (
                <div key={f.label} className={s.fact}><dt>{f.label}</dt><dd>{f.value}</dd></div>
              ))}
            </dl>
            <span className={s.flipFront}>{flip("front")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
