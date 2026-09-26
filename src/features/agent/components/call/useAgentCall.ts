"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConfirmEvent } from "../../events";
import { type AgentItem, type ConfirmState, useAgentRun } from "../useAgentRun";
import { type CallEngineName, type CallMode, type CallStatus, isAppPath, SPOKEN_YES } from "./callTypes";
import { type AgentVoiceSession, type CallEngine, createBrowserEngine, createVapiEngine, type EngineHandlers } from "./engines";
import { type Mic, openMic } from "./mic";
import { useThreadFeed } from "./useThreadFeed";

type Run = ReturnType<typeof useAgentRun>;
export type CallDone = { id: string; title: string; amount: string | null };

const speechLang = (locale: string) => (locale === "fr" ? "fr-FR" : "en-US");

async function agentSession(): Promise<AgentVoiceSession | null> {
  const body = (await fetch("/api/voice/session?agent=1", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null)) as Partial<AgentVoiceSession> | null;
  // an older session route answers for the voice pill, not the agent: only a
  // reply that carries the thread handshake is the agent's line
  if (body?.provider !== "vapi" || body.threadId === undefined || !body.overrides) return null;
  return body as AgentVoiceSession;
}

function openConfirm(items: AgentItem[], confirms: Record<string, ConfirmState>) {
  return [...items].reverse().find((i): i is AgentItem & ConfirmEvent => i.type === "confirm" && (confirms[i.id] ?? "open") === "open") ?? null;
}

function doneOnCall(items: AgentItem[], confirms: Record<string, ConfirmState>): CallDone[] {
  return items.flatMap((i) => (i.type === "confirm" && confirms[i.id] === "done" ? [{ id: i.id, title: i.title, amount: i.facts.find((f) => f.cents !== undefined)?.value ?? null }] : []));
}

// The call, app-wide: which engine carries it, where it stands, what was said,
// and the same run the chat uses, so steps, results and confirms render the
// same way in the widget and on the agent page.
export function useAgentCall(role: "brand" | "creator", csrfToken: string) {
  const router = useRouter();
  const locale = useLocale();
  const run: Run = useAgentRun(role, csrfToken, { onNavigate: (e) => { if (isAppPath(e.href)) router.push(e.href); } });
  const [status, setStatus] = useState<CallStatus>("idle");
  const [engineName, setEngineName] = useState<CallEngineName | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const [caption, setCaption] = useState({ you: "", agent: "" });
  const [threadId, setThreadId] = useState<string | null>(null);
  const [minimised, setMinimised] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const engine = useRef<CallEngine | null>(null);
  const mic = useRef<Mic | null>(null);
  const input = useRef(0);
  const output = useRef(0);
  const generation = useRef(0);
  const spoken = useRef(new Set<string>());
  const latest = useRef({ run, status });
  useEffect(() => {
    latest.current = { run, status };
  });

  const readInput = useCallback(() => (mic.current ? mic.current.read() : input.current), []);
  const readOutput = useCallback(() => output.current, []);
  const feedOk = useThreadFeed(threadId, status === "live" && engineName === "vapi", run.ingest);

  const release = useCallback(() => {
    generation.current += 1;
    engine.current?.stop();
    engine.current = null;
    mic.current?.close();
    mic.current = null;
    input.current = 0;
    output.current = 0;
    setSpeaking(false);
    setAwaiting(false);
  }, []);

  const finish = useCallback((next: CallStatus = "ended") => {
    release();
    setEndedAt(Date.now());
    setMinimised(false);
    setStatus((s) => (s === "live" || s === "connecting" ? next : s));
  }, [release]);

  const heard = useCallback((text: string) => {
    const { run: r } = latest.current;
    const open = openConfirm(r.items, r.confirms);
    // on the browser line a spoken yes settles the card here; on Vapi the
    // voice side runs it and the feed reports it, so it never runs twice
    if (engine.current?.name === "browser") {
      if (open && SPOKEN_YES.test(text.trim())) void r.decide(open, "confirm");
      else void r.send(text);
      return;
    }
    r.addUser(text);
    setAwaiting(true);
  }, []);

  const handlers = useCallback((): EngineHandlers => ({
    onUser: (text, final) => {
      setCaption((c) => ({ ...c, you: text }));
      if (final) heard(text);
    },
    onAgent: (text, final) => {
      setCaption((c) => ({ ...c, agent: text }));
      if (final) setAwaiting(false);
    },
    onSpeaking: (on) => {
      setSpeaking(on);
      if (on) setAwaiting(false);
    },
    onInputLevel: (v) => { input.current = v; },
    onOutputLevel: (v) => { output.current = v; },
    onEnd: () => finish(),
    onError: (message) => finish(message === "not-allowed" ? "denied" : "ended"),
  }), [finish, heard]);

  const connect = useCallback(async (gen: number) => {
    const got = await openMic();
    if (gen !== generation.current) return got.ok ? got.mic.close() : undefined;
    if (!got.ok) return setStatus(got.reason === "denied" ? "denied" : "failed");
    const session = await agentSession();
    let next: CallEngine | null = null;
    if (session) {
      try {
        next = await createVapiEngine(session, handlers());
        engine.current = next;
        await next.start();
        got.mic.close();
        run.adopt(session.threadId);
        setThreadId(session.threadId);
      } catch {
        next?.stop();
        next = null;
      }
    }
    if (gen !== generation.current) return got.mic.close();
    if (!next) {
      try {
        next = createBrowserEngine(handlers(), speechLang(locale));
        engine.current = next;
        await next.start();
        mic.current = got.mic;
      } catch {
        got.mic.close();
        engine.current = null;
        return setStatus("failed");
      }
    }
    if (gen !== generation.current) return next.stop();
    setEngineName(next.name);
    setStartedAt(Date.now());
    setStatus("live");
  }, [handlers, locale, run]);

  const start = useCallback(() => {
    setDismissed(false);
    setMinimised(false);
    const { status: now } = latest.current;
    if (now === "live" || now === "connecting") return;
    release();
    run.reset();
    spoken.current.clear();
    setCaption({ you: "", agent: "" });
    setThreadId(null);
    setMuted(false);
    setEndedAt(null);
    setEngineName(null);
    setStatus("connecting");
    void connect(generation.current);
  }, [connect, release, run]);

  // the browser line reads each finished reply aloud, once
  useEffect(() => {
    if (status !== "live" || engineName !== "browser") return;
    const last = [...run.items].reverse().find((i) => i.type === "message");
    if (!last || last.type !== "message" || !last.final || spoken.current.has(last.id)) return;
    spoken.current.add(last.id);
    engine.current?.speak(last.text);
  }, [run.items, status, engineName]);

  useEffect(() => release, [release]);

  const lastMessage = [...run.items].reverse().find((i) => i.type === "message");
  const agentCaption = engineName === "browser" ? (lastMessage?.type === "message" ? lastMessage.text : "") : caption.agent;
  const mode: CallMode = status !== "live" ? "rest" : speaking ? "speaking" : run.busy || awaiting ? "thinking" : muted ? "muted" : "listening";

  return useMemo(() => ({
    role, status, engineName, startedAt, endedAt, muted, mode, minimised, dismissed, run, threadId,
    feedOk: engineName === "browser" || feedOk,
    hasFeed: engineName === "browser" || threadId !== null,
    caption: { you: caption.you, agent: agentCaption },
    open: openConfirm(run.items, run.confirms),
    done: doneOnCall(run.items, run.confirms),
    readInput,
    readOutput,
    start,
    // hanging up before it connected isn't a call: nothing to summarise
    end: () => {
      if (status !== "connecting") return finish();
      release();
      setStatus("idle");
    },
    toggleMute: () => {
      engine.current?.setMuted(!muted);
      setMuted(!muted);
    },
    setMinimised,
    decide: (event: ConfirmEvent, decision: "confirm" | "cancel") => void run.decide(event, decision),
    continueInChat: () => {
      setDismissed(true);
      router.push(`/${role}/agent`);
    },
    close: () => {
      release();
      setStatus("idle");
      setDismissed(false);
    },
  }), [role, status, engineName, startedAt, endedAt, muted, mode, minimised, dismissed, run, threadId, feedOk, caption.you, agentCaption, start, finish, release, router, readInput, readOutput]);
}

export type AgentCall = ReturnType<typeof useAgentCall>;
