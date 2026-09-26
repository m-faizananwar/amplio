// The agent's colour for the canvas-drawn bot: canvases take literal colours,
// not CSS variables, so the theme's accent (--money, globals.css) is spelled
// out here once per theme. Keep the two in step.
export const AGENT_ACCENT = { light: "#2563EB", dark: "#60A5FA" } as const;

// The bot on the rail's filled (current-page) square takes the square's ink,
// as every other nav icon does ([aria-current] .nav-icon → --surface).
export const AGENT_ON_ACCENT = { light: "#FFFFFF", dark: "#18181B" } as const;
