import "server-only";
import { createHash } from "node:crypto";
import { BRAND } from "@/config/brand";
import { agentEnabled } from "@/features/agent/server/flag";
import { VAPI_API_URL, VAPI_ASSISTANT_NAME } from "../constants";
import { webhookSecret } from "./voice-token";

export const isVapiConfigured = () => Boolean(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && process.env.VAPI_PRIVATE_KEY);

// With agent mode the call's brain is our agent: Vapi's model only relays the
// caller's words to the "command" tool and speaks back what it returns.
const AGENT_PROMPT = `You are the voice of ${BRAND.name}'s agent. You do not answer anything yourself.
Every time the user says something, call the "command" tool with their words, verbatim. Then say the tool's result exactly as given, word for word, adding nothing and leaving nothing out.
Never set confirmed=true. Never invent an answer if the tool fails; say the tool's words.`;

const INTENT_PROMPT = `You are ${BRAND.name}'s voice assistant inside a LinkedIn creator marketplace. Keep replies to one short sentence.
Call the "command" tool with the user's words, verbatim, for anything that is an action or a navigation. For a money or status change the tool first answers with a question ending in "Confirm?" — say it and wait. Only if the user clearly says yes, call "command" again with the ORIGINAL command and confirmed=true. Never set confirmed=true on your own.`;

// The agent can take a while on a multi-step request: Vapi waits up to 40 s
// for the tool (its default is 20) and fills the silence meanwhile.
const TOOL_TIMEOUT_S = 40;
const DELAYED_MS = 7000;

const commandTool = (serverUrl: string) => ({
  type: "function",
  async: false,
  server: { url: serverUrl, timeoutSeconds: TOOL_TIMEOUT_S, headers: { "x-vapi-secret": webhookSecret() } },
  messages: [
    { type: "request-start", content: "One sec, I'm on it." },
    { type: "request-response-delayed", content: "Still working on it, nearly there.", timingMilliseconds: DELAYED_MS },
  ],
  function: {
    name: "command",
    description: "Send what the user just said to the app, which does the work and returns the words to say.",
    parameters: {
      type: "object",
      properties: {
        transcript: { type: "string", description: "The user's words, verbatim." },
        confirmed: { type: "boolean", description: "Leave unset." },
      },
      required: ["transcript"],
    },
  },
});

const NAME_MAX = 40; // Vapi's limit
export const assistantName = (serverUrl: string) => `${VAPI_ASSISTANT_NAME} · ${new URL(serverUrl).host}`.slice(0, NAME_MAX);

export const assistantBody = (serverUrl: string) => ({
  name: assistantName(serverUrl),
  // the browser overrides this with the caller's language at call start
  firstMessage: "Hi, it's your Amplio agent. What are we working on?",
  firstMessageMode: "assistant-speaks-first",
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [{ role: "system", content: agentEnabled() ? AGENT_PROMPT : INTENT_PROMPT }],
    tools: [commandTool(serverUrl)],
  },
  voice: { provider: "11labs", voiceId: "sarah", model: "eleven_flash_v2_5" },
  transcriber: { provider: "deepgram", model: "nova-3", language: "multi" },
  // barge-in: the caller talking over the agent stops it after a word
  stopSpeakingPlan: { numWords: 1, voiceSeconds: 0.2, backoffSeconds: 1 },
  startSpeakingPlan: { waitSeconds: 0.4 },
  silenceTimeoutSeconds: 30,
  maxDurationSeconds: 900,
  endCallPhrases: ["goodbye", "bye for now", "au revoir"],
  metadata: { app: `${BRAND.key}-rebuild` },
});

type Remote = { id: string; name?: string; metadata?: { configHash?: string } };
const HASH_LEN = 16;
let cached: { serverUrl: string; id: string } | null = null;

// Find-or-create by name (one assistant per host, so a local or preview
// server never repoints production's), once per server process. Created from
// code so the dashboard is never a manual step.
export async function ensureAssistant(serverUrl: string): Promise<string> {
  if (cached?.serverUrl === serverUrl) return cached.id;
  const headers = { Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}`, "Content-Type": "application/json" };
  const name = assistantName(serverUrl);
  const list = await fetch(`${VAPI_API_URL}/assistant?limit=100`, { headers }).then((r) => (r.ok ? r.json() : []));
  const existing = Array.isArray(list) ? (list as Remote[]).find((a) => a.name === name) : null;
  // A cold start only rewrites the assistant when its config changed: the
  // hash rides in its metadata, so an unchanged one costs a single request.
  const body = assistantBody(serverUrl);
  const hash = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, HASH_LEN);
  if (existing?.metadata?.configHash === hash) {
    cached = { serverUrl, id: existing.id };
    return existing.id;
  }
  const method = existing ? "PATCH" : "POST";
  const url = existing ? `${VAPI_API_URL}/assistant/${existing.id}` : `${VAPI_API_URL}/assistant`;
  const res = await fetch(url, { method, headers, body: JSON.stringify({ ...body, metadata: { ...body.metadata, configHash: hash } }) });
  if (!res.ok) throw new Error(`Vapi ${method} assistant failed: ${res.status} ${await res.text()}`);
  const { id } = (await res.json()) as { id: string };
  cached = { serverUrl, id };
  return id;
}
