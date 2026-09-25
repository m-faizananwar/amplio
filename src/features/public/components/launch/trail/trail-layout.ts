// Where everything in the hero's trail sits, in CSS pixels of the canvas.
// Pure maths, seeded, so the WebGL scene and the static fallback draw the
// same picture: the mark's three dots (posts) on the left, a creator's
// audience fanning out in the middle, the brand's site on the right, and the
// ledger column past it where sign-ups settle as rows.

export type Point = { x: number; y: number };
export type TrailLayout = {
  width: number;
  height: number;
  sources: Point[];
  audience: Point[];
  site: Point;
  ledger: { x: number; top: number; rowHeight: number; rowWidth: number; rows: number };
  /** audience index → the source it hangs off */
  parentOf: number[];
};

// the mark's bend (BrandMark MARK_POINTS), as fractions of its 24px box
const MARK = [
  [3.5, 18.5],
  [11.5, 15],
  [20.5, 5],
] as const;
const LEDGER_ROWS_MAX = 12;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function layoutTrail(width: number, height: number, counts: { audience: number; ledgerRows: number }): TrailLayout {
  const audienceCount = counts.audience;
  const ledgerRows = counts.ledgerRows;
  const narrow = width < 640;
  const rand = rng(7);
  // the mark, scaled up into the left third (bottom band on phones)
  // desktop: the trail fills the right half, the headline owns the left;
  // phones: the trail sits in the lower half, under the text
  const markBox = narrow ? Math.min(width * 0.3, 120) : Math.min(width * 0.13, height * 0.3, 190);
  const markX = narrow ? width * 0.06 : width * 0.47;
  const markY = narrow ? height * 0.64 : height * 0.2;
  const sources = MARK.map(([x, y]) => ({ x: markX + (x / 24) * markBox, y: markY + (y / 24) * markBox }));

  const site = { x: width * (narrow ? 0.74 : 0.8), y: height * (narrow ? 0.78 : 0.56) };
  const ledgerX = width * (narrow ? 0.8 : 0.86);
  const rowHeight = narrow ? 9 : 14;
  const rows = Math.min(ledgerRows, LEDGER_ROWS_MAX);
  const ledger = { x: ledgerX, top: site.y - (rows * rowHeight) / 2, rowHeight, rowWidth: width * (narrow ? 0.14 : 0.1), rows };

  // the audience: a loose cloud between the mark and the site, denser near the middle
  const audience: Point[] = [];
  const parentOf: number[] = [];
  const left = sources[2].x + width * 0.04;
  const right = site.x - width * 0.06;
  for (let i = 0; i < audienceCount; i++) {
    const u = rand();
    const v = rand();
    const spread = Math.sin(Math.PI * u);
    const midY = narrow ? height * 0.78 : height * 0.52;
    const band = narrow ? 0.28 : 0.62;
    audience.push({ x: left + (right - left) * u, y: midY + (v - 0.5) * height * band * (0.45 + 0.55 * spread) });
    parentOf.push(Math.floor(rand() * sources.length));
  }
  return { width, height, sources, audience, site, ledger, parentOf };
}
