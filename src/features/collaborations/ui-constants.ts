import { BRAND } from "@/config/brand";
// Numbers and copy shared by the collaboration screens (constants.ts is owned
// by the state-machine stream; this file holds everything the views need).

export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_ROWS_PER_PAGE: (typeof ROWS_PER_PAGE_OPTIONS)[number] = 10;

export const DRAFT_MIN_CHARS = 80;
export const DRAFT_MAX_CHARS = 3000;
export const REVIEW_NOTE_MIN_CHARS = 10;
export const REVIEW_NOTE_MAX_CHARS = 1000;
export const MESSAGE_MAX_CHARS = 2000;
export const MESSAGE_PREVIEW_CHARS = 80;
export const MAX_THREAD_MESSAGES = 200;

// Text after the tracking code in the redirect URL; the /r/[code] route is
// built by the tracking stream, the collaboration screens only show the URL.
export const TRACKED_LINK_PATH = "/r";

export const QUICK_REACTIONS = ["👍", "🙏", "🔥", "🎉", "💯", "👏", "😂", "❤️", "🚀", "👀", "✅", "🤝"] as const;
export const SUPPORT_BOT = {
  name: `${BRAND.bot}`,
  preview: "Have a question or need help? Click here.",
  reply:
    `Hi! I'm ${BRAND.bot}. I can't answer yet in this build, but your bookings, briefs and payouts are all a click away in the sidebar. A human from ${BRAND.name} replies to real questions within a business day.`,
} as const;

export const COPY = {
  opportunitiesTitle: "Opportunities",
  opportunitiesDescription: "Open brand campaigns - apply, the brand accepts, and the booking is created on your terms.",
  collaborationsTitle: "Collaborations",
  creatorCollaborationsDescription: "Every step tells you where you stand, what to do, and what happens if you do nothing.",
  brandCollaborationsDescription: "Every collaboration across your campaigns, with its status, next action and due date.",
  creatorEmpty: "No collaborations yet. Brand invitations and your accepted applications land here.",
  brandEmpty: "No collaborations yet, invite a creator from the Marketplace.",
  reviewTitle: "Review LinkedIn post",
  reviewDescription: "Read the complete draft before approving or requesting changes.",
  brandThreadsEmptyTitle: "Threads open with your bookings",
  brandThreadsEmptyBody: "Invite a creator - the thread opens as soon as the first booking is accepted.",
  creatorThreadsEmptyBody: "The thread opens as soon as a booking is accepted.",
  composerPlaceholder: "Write a message…",
} as const;
