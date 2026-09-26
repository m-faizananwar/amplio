// Agent mode ships dark: the pages, the sidebar item, ⌘K and the backend's
// routes all read this one flag (CLAUDE.md: half-done work behind NEXT_PUBLIC_FF_*).
export const AGENT_MODE = process.env.NEXT_PUBLIC_FF_AGENT_MODE === "1";
