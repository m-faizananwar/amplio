"use client";

import { Check, Circle } from "lucide-react";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { Burst } from "@/components/graphics/Burst";
import { buttonVariants } from "@/components/ui/button";
import s from "./setup-card.module.css";

const R = 26;
const CIRCUMFERENCE = 2 * Math.PI * R;

type Props = {
  seenKey: string;
  finished: boolean;
  done: number;
  total: number;
  steps: { key: string; title: string; done: boolean }[];
  next: { title: string; why: string; href: string } | null;
  labels: { progress: string; next: string; continue: string; doneTitle: string; doneBody: string };
  // shown instead once the "You're set up" moment has been seen
  then?: ReactNode;
};

function readSeen(key: string) {
  try { return window.localStorage.getItem(key) === "1"; } catch { return false; }
}

// While setup is unfinished: the ring, the next step and Continue. The visit
// after it finishes: the ring closes and "You're set up" shows once, with a
// small burst; after that the card is gone for good (remembered per browser).
export function SetupCardView({ seenKey, finished, done, total, steps, next, labels, then = null }: Props) {
  const [hidden, setHidden] = useState(finished);
  useEffect(() => {
    if (!finished) return;
    if (readSeen(seenKey)) return;
    try { window.localStorage.setItem(seenKey, "1"); } catch { /* storage can be blocked */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shown once, decided after mount (storage isn't on the server)
    setHidden(false);
  }, [finished, seenKey]);
  if (hidden) return then;
  const share = finished ? 1 : done / total;
  return (
    <section className={`${s.card} ${finished ? s.done : ""}`} aria-live="polite">
      <div className={s.ring}>
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle className={s.track} cx="32" cy="32" r={R} fill="none" strokeWidth="6" />
          <circle className={s.arc} cx="32" cy="32" r={R} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} style={{ strokeDashoffset: CIRCUMFERENCE * (1 - share) } as CSSProperties} />
        </svg>
        <span className={`${s.count} num`}>{finished ? <Check className="size-5 text-money" aria-hidden="true" /> : `${done}/${total}`}</span>
        {finished ? <Burst /> : null}
      </div>
      <div>
        <p className={s.title}>{finished ? labels.doneTitle : next ? labels.next.replace("{step}", next.title) : labels.progress}</p>
        <p className={s.why}>{finished ? labels.doneBody : next?.why ?? labels.progress}</p>
        <ul className={s.checks} aria-label={labels.progress}>
          {steps.map((st) => (
            <li key={st.key} data-done={st.done ? "" : undefined}>{st.done ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}{st.title}</li>
          ))}
        </ul>
      </div>
      {!finished && next ? <Link href={next.href} className={`${buttonVariants()} ${s.cta}`}>{labels.continue}</Link> : null}
    </section>
  );
}
