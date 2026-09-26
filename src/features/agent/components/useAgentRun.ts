"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentEvent, ConfirmEvent } from "../events";
import type { CallEvent, NavigateEvent } from "./call/callTypes";
import { BRAND_RUN_FIXTURE, CREATOR_RUN_FIXTURE } from "../fixtures";

const RUN_URL = "/api/agent";
const CONFIRM_URL = "/api/agent/confirm";
const SAMPLE_GAP_MS = 550;
const HISTORY_TURNS = 10;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// a 403 means the csrf token no longer matches the session: only a reload fixes it
const FORBIDDEN = 403;
export const STALE = "stale";

export type ConfirmState = "open" | "working" | "done" | "cancelled";
// What the page renders: the stream's events, plus the person's own turns,
// each with a stable key.
export type AgentItem = { key: string } & (AgentEvent | { type: "user"; text: string });

// One conversation. Steps and confirms that arrive again with the same id
// replace the earlier row; message chunks with the same id join into one.
// The live agent streams SSE; while its route answers 404 (flag off, or not
// deployed) a recorded sample plays instead and `sample` says so.
type Options = { onNavigate?: (event: NavigateEvent) => void };

export function useAgentRun(role: "brand" | "creator", csrfToken: string, options: Options = {}) {
  // both routes check the session's CSRF token, as /api/assistant/chat does
  const headers = { "content-type": "application/json", "x-csrf-token": csrfToken };
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<AgentItem[]>([]);
  const [confirms, setConfirms] = useState<Record<string, ConfirmState>>({});
  const [busy, setBusy] = useState(false);
  const [sample, setSample] = useState(false);
  const seq = useRef(0);
  const thread = useRef<{ id: string | null; history: Array<{ role: "user" | "assistant"; text: string }> }>({ id: null, history: [] });
  const onNavigate = useRef(options.onNavigate);
  useEffect(() => {
    onNavigate.current = options.onNavigate;
  });

  const apply = useCallback((incoming: AgentEvent | CallEvent) => {
    // a page move and a settled confirm change state, not the thread's rows
    if (incoming.type === "navigate") return void onNavigate.current?.(incoming);
    if (incoming.type === "resolved") {
      setConfirms((c) => ({ ...c, [incoming.id]: incoming.outcome === "failed" ? "open" : incoming.outcome }));
      // a done action may have moved money: the shell's wallet chip re-reads it
      if (incoming.outcome === "done") router.refresh();
      return;
    }
    const event: AgentEvent = incoming;
    if (event.type === "done") thread.current.id = event.threadId;
    if (event.type === "message" && event.final) thread.current.history.push({ role: "assistant", text: event.text });
    setItems((prev) => {
      const keyed = (key: string): AgentItem => ({ ...event, key });
      if (event.type === "step" || event.type === "confirm") {
        const at = prev.findIndex((p) => p.type === event.type && "id" in p && p.id === event.id);
        if (at >= 0) return prev.map((p, i) => (i === at ? keyed(p.key) : p));
        return [...prev, keyed(`${event.type}-${event.id}`)];
      }
      if (event.type === "message") {
        const at = prev.findIndex((p) => p.type === "message" && p.id === event.id);
        if (at >= 0) return prev.map((p, i) => (i === at && p.type === "message" ? { ...p, text: event.final ? event.text : p.text + event.text, final: event.final } : p));
      }
      seq.current += 1;
      return [...prev, keyed(`${event.type}-${seq.current}`)];
    });
  }, [router]);

  const read = useCallback(async (res: Response) => {
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      for (let end = buffer.indexOf("\n\n"); end >= 0; end = buffer.indexOf("\n\n")) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const data = frame.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
        if (data) apply(JSON.parse(data) as AgentEvent | CallEvent);
      }
    }
  }, [apply]);

  const play = useCallback(async (events: AgentEvent[]) => {
    for (const event of events) {
      await sleep(SAMPLE_GAP_MS);
      apply(event);
    }
  }, [apply]);

  const send = useCallback(async (text: string) => {
    seq.current += 1;
    const turn = { key: `user-${seq.current}`, type: "user" as const, text };
    setItems((prev) => [...prev, turn]);
    thread.current.history.push({ role: "user", text });
    setBusy(true);
    try {
      const { id, history } = thread.current;
      const res = await fetch(RUN_URL, { method: "POST", headers, body: JSON.stringify({ text, threadId: id, history: id ? undefined : history.slice(-HISTORY_TURNS), locale }) });
      if (res.status === 404) {
        setSample(true);
        await play(role === "creator" ? CREATOR_RUN_FIXTURE : BRAND_RUN_FIXTURE);
      } else if (res.status === FORBIDDEN) apply({ type: "error", message: STALE, retryable: false });
      else if (!res.ok) apply({ type: "error", message: `agent ${res.status}`, retryable: true });
      else await read(res);
    } catch {
      apply({ type: "error", message: "network", retryable: true });
    } finally {
      setBusy(false);
    }
  }, [apply, locale, play, read, role, csrfToken]); // eslint-disable-line react-hooks/exhaustive-deps -- headers is derived from csrfToken

  const decide = useCallback(async (event: ConfirmEvent, decision: "confirm" | "cancel") => {
    setConfirms((c) => ({ ...c, [event.id]: "working" }));
    if (sample) {
      await sleep(SAMPLE_GAP_MS);
      setConfirms((c) => ({ ...c, [event.id]: decision === "confirm" ? "done" : "cancelled" }));
      return;
    }
    try {
      const res = await fetch(CONFIRM_URL, { method: "POST", headers, body: JSON.stringify({ id: event.id, threadId: thread.current.id, decision }) });
      if (!res.ok) throw new Error(res.status === FORBIDDEN ? STALE : `confirm ${res.status}`);
      setConfirms((c) => ({ ...c, [event.id]: decision === "confirm" ? "done" : "cancelled" }));
      await read(res);
      if (decision === "confirm") router.refresh();
    } catch (error) {
      setConfirms((c) => ({ ...c, [event.id]: "open" }));
      apply({ type: "error", message: error instanceof Error && error.message === STALE ? STALE : "confirm", retryable: false });
    }
  }, [apply, read, sample, csrfToken, router]); // eslint-disable-line react-hooks/exhaustive-deps -- headers is derived from csrfToken

  const reset = useCallback(() => {
    setItems([]);
    setConfirms({});
    thread.current = { id: null, history: [] };
  }, []);

  // Continue a stored thread: the server keeps its turns, so the next message
  // carries only its id.
  const resume = useCallback((threadId: string) => {
    reset();
    thread.current.id = threadId;
  }, [reset]);

  // A call feeds its own events and the words it heard into the same rows.
  const addUser = useCallback((text: string) => {
    seq.current += 1;
    setItems((prev) => [...prev, { key: `user-${seq.current}`, type: "user", text }]);
  }, []);
  const adopt = useCallback((threadId: string | null) => {
    thread.current.id = threadId;
  }, []);

  return { items, confirms, busy, sample, send, decide, reset, resume, ingest: apply, addUser, adopt };
}
