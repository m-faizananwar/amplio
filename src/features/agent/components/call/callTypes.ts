// The call's own vocabulary. `navigate` and `resolved` arrive in the same
// stream as the agent's other events: the first moves the page under the
// call, the second settles a confirm card however it was decided (a tap, or a
// spoken yes that the voice side ran).
export type NavigateEvent = { type: "navigate"; href: string; label?: string };
export type ResolvedEvent = { type: "resolved"; id: string; outcome: "done" | "cancelled" | "failed" };
export type CallEvent = NavigateEvent | ResolvedEvent;

export type CallStatus = "idle" | "connecting" | "live" | "ended" | "denied" | "failed";
export type CallEngineName = "vapi" | "browser";
export type CallMode = "listening" | "thinking" | "speaking" | "muted" | "rest";

// Only this app's own pages: a navigate event can never send the page elsewhere.
const APP_PATH = /^\/(brand|creator)(\/[\w\-./%]*)?(\?[\w\-.=&%]*)?$/;
export const isAppPath = (href: string) => APP_PATH.test(href) && !href.includes("//") && !href.includes("..");

// "yes" said to an open confirm card, in either language
export const SPOKEN_YES = /^(yes|yeah|yep|confirm|go ahead|oui|d'accord|d’accord|vas-y|allez-y|ok)\b/i;

export const FEED_POLL_MS = 1000;
// a Vapi start that hasn't connected by then falls back to the browser line
export const VAPI_START_TIMEOUT_MS = 15000;
export const SECOND_MS = 1000;
