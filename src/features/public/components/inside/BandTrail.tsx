import type { CSSProperties } from "react";
import { Stage } from "../stage/Stage";
import s from "./inside.module.css";

const LINES = [
  "M-40 300 C 180 240, 320 330, 520 250 S 900 180, 1480 240",
  "M-40 420 C 220 380, 420 460, 700 380 S 1100 330, 1480 390",
  "M-40 180 C 260 150, 480 220, 760 150 S 1160 110, 1480 150",
];
const NODES = [[260, 262], [700, 380], [1120, 350], [500, 190], [940, 205]];

// The trail motif across the band: three lines, their nodes, and dots
// drifting along them. Paused off-screen by Stage; still under reduced motion.
export function BandTrail() {
  return (
    <Stage loop className={s.trail}>
      <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMid slice" className={s.trail} aria-hidden="true">
        {LINES.map((d) => <path key={d} d={d} className={s.line} />)}
        {NODES.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" className={s.node} />)}
        {LINES.flatMap((d, i) => [0, 1, 2].map((k) => (
          <circle key={`${i}-${k}`} r="3.5" className={s.dot} style={{ offsetPath: `path("${d}")`, "--t": `${14 + i * 3}s`, "--d": `${-(k * 5 + i * 2)}s` } as CSSProperties} />
        )))}
      </svg>
    </Stage>
  );
}
