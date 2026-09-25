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

