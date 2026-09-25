// LED dot type (metric-cards-spec §"LED DOT TYPE"): 7-row bitmap glyphs rendered
// as filled circles. M, s, u, b are ours, in the same 5-column style, so the
// landing's "Measurable" renders.
export const GLYPHS: Record<string, string> = {
  "0": "01110 10001 10011 10101 11001 10001 01110",
  "1": "010 110 010 010 010 010 111",
  "2": "01110 10001 00001 00010 00100 01000 11111",
  "3": "11110 00001 00001 01110 00001 00001 11110",
  "4": "00010 00110 01010 10010 11111 00010 00010",
  "5": "11111 10000 10000 11110 00001 00001 11110",
  "6": "01110 10000 10000 11110 10001 10001 01110",
  "7": "11111 00001 00010 00100 01000 01000 01000",
  "8": "01110 10001 10001 01110 10001 10001 01110",
  "9": "01110 10001 10001 01111 00001 00001 01110",
  ".": "0 0 0 0 0 0 1",
  ",": "00 00 00 00 00 01 10",
  I: "111 010 010 010 010 010 111",
  a: "00000 00000 01110 00001 01111 10001 01111",
  e: "00000 00000 01110 10001 11111 10000 01110",
  g: "00000 00000 01111 10001 01111 00001 01110",
  i: "1 0 1 1 1 1 1",
  l: "10 10 10 10 10 10 01",
  n: "00000 00000 11110 10001 10001 10001 10001",
  t: "010 010 111 010 010 010 001",
  r: "00000 00000 10110 11001 10000 10000 10000",
  M: "10001 11011 10101 10101 10001 10001 10001",
  s: "00000 00000 01111 10000 01110 00001 11110",
  u: "00000 00000 10001 10001 10001 10011 01101",
  b: "10000 10000 10110 11001 10001 10001 11110",
};

const SVG_NS = "http://www.w3.org/2000/svg";
const PITCH_Y = 4;
const GAP = 1;
const DOT_OFFSET = 1.55;
const ROWS = 7;

export function renderDots(el: HTMLElement) {
  const text = el.getAttribute("data-dots") ?? "";
  const isWord = el.classList.contains("dot-word");
  const pitchX = isWord ? 4 : 5;
  const dotRadius = isWord ? 1.8 : el.closest(".metric--context") ? 2.32 : 1.55;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "dot-svg");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("aria-hidden", "true");
  let x = 0;
  for (const ch of text) {
    const rows = (GLYPHS[ch] ?? GLYPHS["."]).split(" ");
    const cols = rows[0].length;
    rows.forEach((row, y) => {
      for (let col = 0; col < cols; col++) {
        if (row[col] !== "1") continue;
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", (x + col * pitchX + DOT_OFFSET).toFixed(2));
        dot.setAttribute("cy", (y * PITCH_Y + DOT_OFFSET).toFixed(2));
        dot.setAttribute("r", String(dotRadius));
        svg.appendChild(dot);
      }
    });
    x += (cols + GAP) * pitchX;
  }
  x -= GAP * pitchX;
  svg.setAttribute("viewBox", `0 0 ${x} ${ROWS * PITCH_Y}`);
  el.textContent = "";
  el.appendChild(svg);
}

// Gauge ticks: 23 from 190° in 5° steps, every fifth longer and heavier.
export function renderTicks(group: SVGGElement) {
  const CENTER = 163, OUTER = 142, INNER_MAJOR = 129, INNER_MINOR = 133, START_DEG = 190, STEP_DEG = 5, COUNT = 23, MAJOR_EVERY = 5;
  for (let i = 0; i < COUNT; i++) {
    const angle = ((START_DEG + i * STEP_DEG) * Math.PI) / 180;
    const inner = i % MAJOR_EVERY === 0 ? INNER_MAJOR : INNER_MINOR;
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("class", "tick");
    line.setAttribute("x1", (CENTER + Math.cos(angle) * inner).toFixed(2));
    line.setAttribute("y1", (CENTER + Math.sin(angle) * inner).toFixed(2));
    line.setAttribute("x2", (CENTER + Math.cos(angle) * OUTER).toFixed(2));
    line.setAttribute("y2", (CENTER + Math.sin(angle) * OUTER).toFixed(2));
    line.setAttribute("stroke-width", i % MAJOR_EVERY === 0 ? "1.5" : "1");
    group.appendChild(line);
  }
}
