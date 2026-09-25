import { BRAND } from "@/config/brand";
// Tools the voice layer can run. Anything that moves money or changes a
// collaboration status is confirmation-gated: the assistant asks "confirm?"
// and only runs it after a yes.
export const VOICE_TOOLS = [
  "navigate", "searchCreators", "openCreator", "bookCreator", "openCampaign", "approveDraft", "requestChanges",
  "topUp", "showResults", "applyToCampaign", "submitDraft", "unknown",
] as const;
export type VoiceTool = (typeof VOICE_TOOLS)[number];
export const GATED_TOOLS: readonly VoiceTool[] = ["bookCreator", "approveDraft", "requestChanges", "topUp", "applyToCampaign", "submitDraft"];

export const VOICE_MAX_TOKENS = 300;
export const VOICE_TIMEOUT_MS = 12_000;
export const TRANSCRIPT_MAX_CHARS = 500;
export const YES_PATTERN = /^(yes|yeah|yep|yup|confirm|confirmed|do it|go ahead|sure|ok|okay|please)\b/i;
export const NO_PATTERN = /^(no|nope|cancel|stop|never mind|nevermind|don't|do not)\b/i;

// Named destinations the "navigate" tool understands, per shell.
export const ROUTES: Record<"brand" | "creator", Record<string, string>> = {
  brand: {
    overview: "/brand", home: "/brand", dashboard: "/brand", creators: "/brand/creators", marketplace: "/brand/creators",
    matching: "/brand/creators/matching", [BRAND.copilot.toLowerCase()]: "/brand/creators/matching", campaigns: "/brand/campaigns",
    collaborations: "/brand/collaborations", results: "/brand/results", messages: "/brand/messages", billing: "/brand/billing",
    wallet: "/brand/billing", invite: "/brand/invite", "book a call": "/brand/book-a-call", integrations: "/brand/integrations",
    settings: "/brand/settings",
  },
  creator: {
    overview: "/creator", home: "/creator", dashboard: "/creator", card: "/creator/card", "my card": "/creator/card",
    opportunities: "/creator/opportunities", collaborations: "/creator/collaborations", analytics: "/creator/analytics",
    earnings: "/creator/earnings", affiliate: "/creator/card", links: "/creator/card", messages: "/creator/messages",
    settings: "/creator/settings",
  },
};

export const VAPI_ASSISTANT_NAME = `${BRAND.name} voice`;
export const VAPI_API_URL = "https://api.vapi.ai";


export const SPEECH_LANG = "en-US";
export const SPEECH_RATE = 1.05;
export const WAVEFORM_BARS = 5;
export const NAVIGATE_DELAY_MS = 350;
