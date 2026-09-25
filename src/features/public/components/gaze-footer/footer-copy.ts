import type { GazeFooterCopy } from "./GazeFooter";

// The spec's copy, verbatim (curly apostrophes, asterisks, line breaks).
// Ours, in the same slots with the same character budgets so the vw layout holds.
export const LANDING_COPY: GazeFooterCopy = {
  leftBadge: "got a campaign idea?",
  leftHeadline: ["creators", "meet buyers"],
  labels: [
    { label: "Sign in", href: "/login" },
    { label: "Start free", href: "/register/brand" },
    { label: "Join as a creator", href: "/register/creator" },
    { label: "Read the FAQ", href: "/faq" },
  ],
  rightBadge: "say hey",
  rightHeadline: ["let’s team up!", "bring us your brief*"],
  note: "*good campaigns start with one post. let’s make yours.",
};
