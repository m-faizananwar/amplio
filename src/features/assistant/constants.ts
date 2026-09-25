// The floating assistant: storage keys, and the limits on what it reads and says.
export const STORAGE_KEYS = { conversation: "amplio.assistant.conversation", collapsed: "amplio.assistant.collapsed" } as const;

export const MESSAGE_MAX_CHARS = 500;
export const ANSWER_MAX_WORDS = 80;
export const ANSWER_MAX_TOKENS = 220;
export const CONTEXT_LIST_MAX = 8;
export const HISTORY_MAX = 6;
