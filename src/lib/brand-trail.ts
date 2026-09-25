// A brand's mark when it has no logo: a short trail — three or four dots
// joined by a line — seeded by the company name, so the same brand draws the
// same trail everywhere and two brands rarely share one. Coordinates are in a
// 24×24 box. Pure.

export type BrandTrail = { points: Array<[number, number]>; d: string };

const BOX_START = 5;
const BOX_END = 19;
const TOP = 6;
const ROW = 3;
const ROWS = 5;
// five heights, 3 apart, from 6 to 18
const HEIGHTS = Array.from({ length: ROWS }, (_, i) => TOP + i * ROW);
const FOUR_DOT_ODDS = 0.5;
const FEW_DOTS = 3;
const MANY_DOTS = 4;
const TENTHS = 10;
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const UINT32 = 0x100000000;
const LCG_A = 1664525;
const LCG_C = 1013904223;

function hash(text: string): number {
  let h = FNV_OFFSET;
  for (const ch of text) h = Math.imul(h ^ (ch.codePointAt(0) ?? 0), FNV_PRIME) >>> 0;
  return h;
}

// A tiny LCG is plenty: the output only has to look varied, not be random.
function sequence(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, LCG_A) + LCG_C) >>> 0;
    return state / UINT32;
  };
}

export function brandTrail(name: string): BrandTrail {
  const next = sequence(hash(name.trim().toLowerCase() || "?"));
  const count = next() < FOUR_DOT_ODDS ? FEW_DOTS : MANY_DOTS;
  const step = (BOX_END - BOX_START) / (count - 1);
  const points: Array<[number, number]> = [];
  let last = -1;
  for (let i = 0; i < count; i++) {
    // never two dots at the same height in a row, so the line always bends
    let h = Math.floor(next() * HEIGHTS.length);
    if (h === last) h = (h + 1 + Math.floor(next() * (HEIGHTS.length - 1))) % HEIGHTS.length;
    last = h;
    points.push([Math.round((BOX_START + i * step) * TENTHS) / TENTHS, HEIGHTS[h]]);
  }
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  return { points, d };
}
