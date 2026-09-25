// Our copy in the spec's slots: our own pricing and product facts, no borrowed figures.
export const STAGE_COPY = {
  headline: { lead: "Built for ", dots: "Measurable", line2: "Performance" },
  intro: ["Every campaign is engineered for reach, fit and", " attribution, giving your brand the numbers", " to prove what a post produced."],
  learnMore: { label: "Learn More", href: "/pricing" },
  cards: {
    speed: { title: ["Self-serve plan", "Per month"], dots: "0", unit: "€", caption: ["Pay only per", "published post"] },
    context: { title: ["Tracked link", "On every post"], dots: "1", unit: "", caption: ["Every click", "comes back as a row"] },
    connections: { title: ["To join", "For creators"], dots: "0", unit: "€", caption: ["Free to join,", "no exclusivity"] },
  },
} as const;

// Self-hosted: the spec's clips re-encoded to 8s 1280px loops (~150–300KB each)
// with their own posters.
const M = "/media";
export const STAGE_MEDIA = {
  wide: { poster: `${M}/stage-wide.jpg`, src: `${M}/stage-wide.mp4` },
  narrow: { poster: `${M}/stage-narrow.jpg`, src: `${M}/stage-narrow.mp4` },
  speed: { poster: `${M}/stage-speed.jpg`, src: `${M}/stage-speed.mp4` },
  context: { poster: `${M}/stage-context.jpg`, src: `${M}/stage-context.mp4` },
  connections: { poster: `${M}/stage-connections.jpg`, src: `${M}/stage-connections.mp4` },
} as const;
