"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentEvent } from "../../events";
import type { CallEvent } from "./callTypes";
import { FEED_POLL_MS } from "./callTypes";

type Feed = { events: Array<{ seq: number; event: AgentEvent | CallEvent }>; seq: number };
const NOT_FOUND = 404;

// During a Vapi call the agent loop runs on the server, so its steps, results
// and confirms are read back from the thread, once a second, after the last
// seq seen. `available` turns false when the feed isn't there (no thread
// tables yet, or an older deploy): the widget then says the steps are in chat.
export function useThreadFeed(threadId: string | null, active: boolean, onEvent: (event: AgentEvent | CallEvent) => void) {
  const [available, setAvailable] = useState(true);
  const handler = useRef(onEvent);
  useEffect(() => {
    handler.current = onEvent;
  });

  useEffect(() => {
    if (!active || !threadId) return;
    let after = 0;
    let stopped = false;
    let timer = 0;
    const tick = async () => {
      try {
        const res = await fetch(`/api/agent/threads/${encodeURIComponent(threadId)}/events?after=${after}`, { cache: "no-store" });
        if (res.status === NOT_FOUND) {
          setAvailable(false);
          return;
        }
        if (res.ok) {
          const body = (await res.json()) as Feed;
          for (const entry of body.events) handler.current(entry.event);
          after = body.seq ?? after;
          setAvailable(true);
        }
      } catch {
        // a missed poll is retried on the next tick
      }
      if (!stopped) timer = window.setTimeout(tick, FEED_POLL_MS);
    };
    void tick();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [threadId, active]);

  return threadId ? available : false;
}
