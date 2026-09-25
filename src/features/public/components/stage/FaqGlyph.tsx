import "./stage.css";

// The small line drawing that opens each FAQ answer, one per question, all
// from the trail motif. It draws itself when the question opens
// (details[open] .faq-draw in stage.css).
const GLYPHS: string[][] = [
  ["M6 34 L22 22 L40 8", "M40 8 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"], // a click travelling to a sign-up
  ["M24 6 a18 18 0 1 0 0.1 0", "M24 14 V34", "M18 18 H28 M18 30 H28"], // a coin
  ["M6 24 H18", "M30 24 H42", "M18 24 a3 3 0 1 0 12 0 a3 3 0 1 0 -12 0"], // two dots joining
  ["M10 6 H32 L38 12 V42 H10 Z", "M16 20 H32 M16 27 H32 M16 34 H26"], // a brief
  ["M8 8 h4 M20 8 h4 M32 8 h4 M8 20 h4 M20 20 h4 M32 20 h4 M8 32 h4 M20 32 h4 M32 32 h4"], // a field of seeded dots
  ["M8 24 a16 16 0 1 1 32 0", "M40 24 l-5 -5 M40 24 l5 -5"], // a loop that ends when you say
];

export function FaqGlyph({ index }: { index: number }) {
  const paths = GLYPHS[index % GLYPHS.length];
  return (
    <svg viewBox="0 0 48 48" className="size-10 shrink-0 text-ink" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={d} d={d} pathLength={1} className="faq-draw" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${i * 140}ms` }} />
      ))}
    </svg>
  );
}
