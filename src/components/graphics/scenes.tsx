import type { CSSProperties } from "react";
import { DrawOnPath } from "./DrawOnPath";
import { Loop } from "./Loop";

// Small hand-drawn scenes for empty states, one motif: the trail. Each is an
// SVG on currentColor that draws once (and loops only where noted, pausing
// under reduced motion). All live in the ledger palette via text-* classes.
const BOX = "h-16 w-28 text-ink-muted";

// No campaigns / opportunities: a blank brief, its lines writing themselves.
export function BlankBriefScene() {
  return (
    <svg viewBox="0 0 112 64" className={BOX} strokeWidth="1.5" aria-hidden="true">
      <rect x="30" y="6" width="52" height="52" rx="4" fill="none" stroke="currentColor" opacity="0.5" />
      <DrawOnPath d="M38 18h30" delay={120} />
      <DrawOnPath d="M38 26h36" delay={320} />
      <DrawOnPath d="M38 34h24" delay={520} />
      <DrawOnPath d="M38 42h32" delay={720} />
    </svg>
  );
}

// No collaborations: two dots reaching for each other and joining.
export function JoiningDotsScene() {
  return (
    <svg viewBox="0 0 112 64" className={BOX} aria-hidden="true">
      <circle cx="30" cy="32" r="5" fill="currentColor" className="g-reach-left" />
      <circle cx="82" cy="32" r="5" fill="currentColor" className="g-reach-right" />
      <DrawOnPath d="M36 32h40" strokeWidth="1.5" delay={500} duration={500} />
    </svg>
  );
}

// No clicks yet: a tracked link sending out ripples (loops, pauses off-motion).
export function LinkRipplesScene() {
  return (
    <Loop><svg viewBox="0 0 112 64" className={BOX} aria-hidden="true">
      <circle cx="56" cy="32" r="4" fill="currentColor" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="56" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" className="g-ripple" style={{ animationDelay: `${i * 600}ms` }} />
      ))}
    </svg></Loop>
  );
}

// No messages: three dots typing (loops, pauses under reduced motion).
export function TypingScene() {
  return (
    <Loop><svg viewBox="0 0 112 64" className={BOX} aria-hidden="true">
      <rect x="28" y="16" width="56" height="30" rx="15" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {[44, 56, 68].map((cx, i) => <circle key={cx} cx={cx} cy="31" r="3" fill="currentColor" className="g-type" style={{ animationDelay: `${i * 150}ms` }} />)}
    </svg></Loop>
  );
}

// Dots scattered over the field, as (x, y); the sweep lights each one as it
// passes, so each dot's delay is its angle from the centre.
const FIELD: Array<[number, number]> = [[40, 20], [70, 16], [78, 40], [46, 46], [62, 30], [34, 34], [84, 26]];
const SWEEP_MS = 2400;
const TURN = 360;
const CENTER: [number, number] = [56, 32];

function sweepDelay([x, y]: [number, number]) {
  // clockwise from 12 o'clock, like the sweep line
  const angle = (Math.atan2(x - CENTER[0], CENTER[1] - y) * (TURN / 2)) / Math.PI;
  return ((angle + TURN) % TURN) / TURN * SWEEP_MS;
}

// No opportunities yet: a radar sweeping a field of dots, lighting each as it
// passes (loops, pauses off screen and under reduced motion).
export function RadarScene() {
  return (
    <Loop><svg viewBox="0 0 112 64" className={BOX} aria-hidden="true">
      {[10, 20, 29].map((r) => <circle key={r} cx={CENTER[0]} cy={CENTER[1]} r={r} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />)}
      {FIELD.map((p) => <circle key={p.join()} cx={p[0]} cy={p[1]} r="2" fill="currentColor" className="g-blip" style={{ animationDelay: `${sweepDelay(p)}ms` } as CSSProperties} />)}
      <g className="g-sweep"><path d={`M${CENTER[0]} ${CENTER[1]}V3`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></g>
      <circle cx={CENTER[0]} cy={CENTER[1]} r="2.5" fill="currentColor" />
    </svg></Loop>
  );
}

// No earnings yet: an empty ledger, its rules drawn, a pen waiting at the
// first line (the pen bobs; loops, pauses off screen and under reduced motion).
export function PenLedgerScene() {
  return (
    <Loop><svg viewBox="0 0 112 64" className={BOX} strokeWidth="1.5" aria-hidden="true">
      <DrawOnPath d="M26 22h60" opacity="0.5" delay={0} />
      <DrawOnPath d="M26 36h60" opacity="0.5" delay={140} />
      <DrawOnPath d="M26 50h60" opacity="0.5" delay={280} />
      <DrawOnPath d="M26 14v42" opacity="0.35" delay={60} />
      <g className="g-pen">
        <path d="M36 19l14-14 4 4-14 14-5 1z" fill="none" stroke="currentColor" strokeLinejoin="round" />
        <circle cx="35" cy="21" r="1.2" fill="currentColor" />
      </g>
    </svg></Loop>
  );
}
