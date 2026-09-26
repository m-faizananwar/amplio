import localFont from "next/font/local";

// Inter 4.001, variable 100–900, self-hosted through next/font and scoped to
// the glass hero and the public header (the rest of the site stays on Geist).
// Subset to the characters en and fr set here (ASCII, the French accents,
// typographic quotes and spaces, the euro), with
// kerning kept: 48 KB → 22 KB, about what the dropped Cormorant weighed, so
// the header costs the public pages nothing at first paint:
//   pyftsubset Inter-4.001-latin.woff2 --flavor=woff2 --layout-features="kern,ccmp,mark,mkmk" --unicodes=
//     "U+0020-007E,U+00A0,U+00AB,U+00B7,U+00BB,U+00C0,U+00C2,U+00C7-00CB,U+00CE-00CF,U+00D4,U+00D9,
//      U+00DB-00DC,U+00E0,U+00E2,U+00E7-00EB,U+00EE-00EF,U+00F4,U+00F9,U+00FB-00FC,U+00FF,U+0152-0153,
//      U+0178,U+2007,U+2009,U+202F,U+2013-2014,U+2018-2019,U+201C-201D,U+2026,U+20AC"
export const inter = localFont({
  src: "./fonts/inter-var-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-hero",
});
