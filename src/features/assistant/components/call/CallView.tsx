"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrailDots } from "../TrailDots";
import { callSession } from "./callSession";
import { useCallLoop } from "./useCallLoop";
import { VoiceMark } from "./VoiceMark";

const TURNS = 6;
const SECOND_MS = 1000;
const MINUTE = 60;

type Props = { role: "brand" | "creator"; csrfToken?: string; account: ReactNode };

// A call with the assistant, full page: the mark as its face, the live
// transcript, mute, end, or type instead. Same brain as the pill.
export function CallView({ role, csrfToken, account }: Props) {
  const t = useTranslations("common.assistant.callMode");
  const router = useRouter();
  const loop = useCallLoop(csrfToken, true);
  const [seconds, setSeconds] = useState(0);
  const [draft, setDraft] = useState("");
  const log = useRef<HTMLOListElement>(null);
  useEffect(() => { const id = window.setInterval(() => setSeconds((s) => s + 1), SECOND_MS); return () => window.clearInterval(id); }, []);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [loop.chat.messages, loop.partial]);
  const end = () => router.push(callSession.end() || `/${role}`);
  const submit = (e: FormEvent) => { e.preventDefault(); const text = draft.trim(); if (!text) return; setDraft(""); void loop.chat.send(text); };
  const turns = loop.chat.messages.slice(-TURNS);
  const note = loop.fault === "unsupported" ? t("faultUnsupported") : loop.fault === "blocked" ? t("faultBlocked") : null;
  const clock = `${String(Math.floor(seconds / MINUTE)).padStart(2, "0")}:${String(seconds % MINUTE).padStart(2, "0")}`;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper text-ink animate-rise" role="dialog" aria-label={t("title")}>
      <header className="flex items-center justify-between border-b border-rule px-6 py-3 text-small">
        <span className="flex items-center gap-2 text-ink-muted"><TrailDots state={loop.chat.busy ? "thinking" : "idle"} />{t("title")} · <span className="num text-ink">{clock}</span></span>
        <div>{account}</div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <VoiceMark listening={loop.listening && !loop.muted} speaking={loop.speaking} />
        <ol ref={log} className="max-h-48 w-full max-w-xl space-y-2 overflow-y-auto text-center text-lead" aria-live="polite" aria-label={t("transcript")}>
          {turns.map((m, i) => <li key={`${i}-${m.role}`} className={m.role === "user" ? "text-ink-muted" : "text-ink"}>{m.text}</li>)}
          {loop.partial ? <li className="text-ink-muted">{loop.partial}</li> : null}
          {turns.length === 0 && !loop.partial ? <li className="text-ink-muted">{note ?? t("prompt")}</li> : null}
        </ol>
      </div>
      <footer className="flex flex-col items-center gap-4 border-t border-rule px-6 py-6">
        <div className="flex items-center gap-3">
          {loop.fault ? null : (
            <Button type="button" variant="secondary" size="icon-lg" onClick={loop.toggleMute} aria-pressed={loop.muted} aria-label={loop.muted ? t("unmute") : t("mute")}>
              {loop.muted ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
            </Button>
          )}
          <Button type="button" variant="danger" size="lg" onClick={end}><PhoneOff aria-hidden="true" />{t("end")}</Button>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-md items-center gap-2">
          <label htmlFor="call-type" className="sr-only">{t("typeInstead")}</label>
          <Input id="call-type" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("typeInstead")} />
          <Button type="submit" variant="secondary">{t("send")}</Button>
        </form>
      </footer>
    </div>
  );
}
