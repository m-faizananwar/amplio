// Scene 2: the post travels through the creator's audience — rings of people
// light up outward from the post, the right ones (fit) drawn in ink.
const RINGS = [
  { r: 70, n: 8 },
  { r: 125, n: 14 },
  { r: 180, n: 20 },
];

export function AudienceVisual() {
  return (
    <svg viewBox="-220 -220 440 440" className="mx-auto w-full max-w-md" aria-hidden="true">
      {RINGS.map((ring, ri) =>
        Array.from({ length: ring.n }, (_, i) => {
          const a = (i / ring.n) * Math.PI * 2 + ri * 0.4;
          const x = Math.cos(a) * ring.r;
          const y = Math.sin(a) * ring.r;
          const fit = (i + ri) % 3 === 0;
          const d = `${ri * 110 + i * 12}ms`;
          return (
            <g key={`${ri}-${i}`}>
              <line x1="0" y1="0" x2={x} y2={y} stroke="var(--color-ink)" strokeOpacity={fit ? 0.25 : 0.08} className="draw" style={{ ["--len" as string]: ring.r, ["--d" as string]: d }} />
              <circle cx={x} cy={y} r={fit ? 6 : 4} fill="var(--color-ink)" fillOpacity={fit ? 1 : 0.25} className="cut" style={{ ["--d" as string]: d }} />
            </g>
          );
        }),
      )}
      <circle r="16" fill="var(--color-ink)" />
      <circle r="16" fill="none" stroke="var(--color-ink)" className="ping" />
    </svg>
  );
}
