"use client";

import { useEffect, useRef, useState } from "react";
import { Beam } from "@/components/motion/Beam";
import { cn } from "@/lib/cn";
import { renderDots } from "../performance/led-dots";
import "./led-metric-card.css";

type Props = { value: string; label: string; caption?: string; className?: string };

// The landing's LED-dot glyphs only cover digits and a dot, so a value like
// "€700" or "3.2×" splits: the number is drawn in dots, the currency or unit
// rides beside it as type, exactly as the stage's cards do.
const NUMBER = /^([^0-9]*)([0-9][0-9.,]*)(.*)$/;

export function LedMetricCard({ value, label, caption, className }: Props) {
  const [hover, setHover] = useState(false);
  const dots = useRef<HTMLSpanElement>(null);
  const match = NUMBER.exec(value);
  const [pre, digits, post] = match ? [match[1], match[2], match[3]] : ["", "", value];

  useEffect(() => {
    if (dots.current && digits) renderDots(dots.current);
  }, [digits]);

  return (
    <Beam size="md" strength={0.6} active={hover} className={cn("rounded-[28px]", className)}>
      <div className="led-card" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
        <p className="led-card__metric" aria-label={value}>
          {pre ? <span className="led-card__affix led-card__affix--pre" aria-hidden="true">{pre}</span> : null}
          {digits ? <span ref={dots} className="led-card__dots" data-dots={digits} aria-hidden="true" /> : <span className="led-card__affix" aria-hidden="true">{post}</span>}
          {digits && post ? <span className="led-card__affix led-card__affix--post" aria-hidden="true">{post}</span> : null}
        </p>
        <p className="led-card__label">{label}</p>
        {caption ? <p className="led-card__caption">{caption}</p> : null}
      </div>
    </Beam>
  );
}
