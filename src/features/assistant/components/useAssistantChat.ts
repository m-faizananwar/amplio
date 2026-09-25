"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { VoiceIntent } from "@/features/voice/schemas";
import { HISTORY_MAX, STORAGE_KEYS } from "../constants";
import type { ChatMessage, ChatResponse } from "../schemas";

const NAVIGATE_DELAY_MS = 400;

function readStored(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.conversation);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

// The typed conversation: kept per tab in sessionStorage, sent to
// /api/assistant/chat with the session's csrf token (tools mutate), and a
// gated tool's pending intent echoed back with the next message ("yes").
export function useAssistantChat(csrfToken: string | undefined) {
  const router = useRouter();
  const t = useTranslations("common.assistant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<VoiceIntent | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from sessionStorage after mount
    setMessages(readStored());
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.conversation, JSON.stringify(messages));
    } catch {
      /* private mode */
    }
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;
      setMessages((m) => [...m, { role: "user", text: message }]);
      setBusy(true);
      const history = messages.slice(-HISTORY_MAX);
      const response = (await post({ message, pending, history, csrfToken })) ?? { ok: false, text: t("offline"), source: "template" as const };
      setPending(response.pending ?? null);
      setMessages((m) => [...m, { role: "assistant", text: response.text }]);
      setBusy(false);
      if (response.navigate) window.setTimeout(() => router.push(response.navigate as string), NAVIGATE_DELAY_MS);
    },
    [busy, messages, pending, csrfToken, router, t],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setPending(null);
  }, []);

  return { messages, busy, send, clear };
}

async function post(input: { message: string; pending: VoiceIntent | null; history: ChatMessage[]; csrfToken?: string }): Promise<ChatResponse | null> {
  try {
    const res = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "content-type": "application/json", ...(input.csrfToken ? { "x-csrf-token": input.csrfToken } : {}) },
      body: JSON.stringify({ message: input.message, pending: input.pending ?? undefined, history: input.history }),
    });
    return (await res.json()) as ChatResponse;
  } catch {
    return null;
  }
}
