// Our copy in the spec's slots. The numbers come from the seeded demo workspace.
export const STAGE_COPY = {
  headline: { lead: "Built for ", dots: "Measurable", line2: "Performance" },
  intro: ["Every campaign is engineered for reach, fit and", " attribution, giving your brand the numbers", " to prove what a post produced."],
  learnMore: { label: "Learn More", href: "/pricing" },
  cards: {
    speed: { title: ["Cost per lead", "Across 312 campaigns"], dots: "18", unit: "€", caption: ["Median cost", "per qualified lead"] },
    context: { title: ["Click-through rate", "Across 1,847 posts"], dots: "12", unit: "%", caption: ["Average CTR", "vs 0.8% for ads"] },
    connections: { title: ["Vetted creators", "Across 100 countries"], dots: "2.4", unit: "K", caption: ["B2B voices", "ready to collaborate"] },
  },
} as const;

// Self-hosted: the spec's clips re-encoded to 8s 1280px loops (~150–300KB each)
// with their own posters; the standalone at /performance/ keeps the CDN originals.
const M = "/media";
export const STAGE_MEDIA = {
  wide: { poster: `${M}/stage-wide.jpg`, src: `${M}/stage-wide.mp4` },
  narrow: { poster: `${M}/stage-narrow.jpg`, src: `${M}/stage-narrow.mp4` },
  speed: { poster: `${M}/stage-speed.jpg`, src: `${M}/stage-speed.mp4` },
  context: { poster: `${M}/stage-context.jpg`, src: `${M}/stage-context.mp4` },
  connections: { poster: `${M}/stage-connections.jpg`, src: `${M}/stage-connections.mp4` },
} as const;
