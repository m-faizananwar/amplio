"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { cn } from "@/lib/cn";
import { CallWaveform } from "./CallWaveform";
import { callSession } from "./callSession";
import { useCallLoop } from "./useCallLoop";

const TURNS = 6;
const ORB_SCALE = 3.75; // 64px preset drawn at 240px
const SECOND_MS = 1000;

type Props = { role: "brand" | "creator"; csrfToken?: string; account: React.ReactNode };

// Full-page call with the assistant: ink ground, the orb as the face, the live
// transcript, a waveform on the mic level, mute / end / type-instead.
export function CallView({ role, csrfToken, account }: Props) {
  const router = useRouter();
  const loop = useCallLoop(csrfToken, true);
  const [seconds, setSeconds] = useState(0);
  const [draft, setDraft] = useState("");
  const log = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), SECOND_MS);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [loop.chat.messages, loop.partial]);

  const end = () => {
    const back = callSession.end();
    router.push(back || `/${role}`);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    void loop.chat.send(t);
  };

  const orbState = loop.listening ? "listening" : loop.speaking ? "composing" : loop.chat.busy ? "working" : "breathing";
  const turns = loop.chat.messages.slice(-TURNS);
  const note = loop.fault === "unsupported" ? "voice needs chrome or edge — typing works" : loop.fault === "blocked" ? "allow the mic in the address bar — typing works" : null;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white" style={{ background: "rgb(13 12 11)" }} role="dialog" aria-label="On a call with Amplio">
      <header className="flex items-center justify-between px-6 py-4 text-sm">
        <span className="text-white/70">On a call with Amplio · <span className="tabular-nums text-white">{mm}:{ss}</span></span>
        <div className="[&_*]:text-white">{account}</div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className={cn("flex size-60 items-center justify-center", loop.speaking && "animate-pulse")} aria-hidden="true">
          <div style={{ transform: `scale(${ORB_SCALE})` }}>
            <ThinkingOrb state={orbState} size={64} theme="dark" />
          </div>
        </div>
        <ol ref={log} className="max-h-48 w-full max-w-xl space-y-2 overflow-y-auto text-center text-base" aria-live="polite" aria-label="Transcript">
          {turns.map((m, i) => (
            <li key={`${i}-${m.role}`} className={m.role === "user" ? "text-white/60" : "text-white"}>{m.text}</li>
          ))}
          {loop.partial ? <li className="text-white/60">{loop.partial}</li> : null}
          {turns.length === 0 && !loop.partial ? <li className="text-white/40">{note ?? (loop.listening ? "Listening…" : "Say something, or type below.")}</li> : null}
        </ol>
        <CallWaveform listening={loop.listening && !loop.muted} speaking={loop.speaking} />
      </div>
      <footer className="flex flex-col items-center gap-4 px-6 pb-8">
        {note ? <p className="text-xs text-white/60">{note}</p> : null}
        <div className="flex items-center gap-3">
          {loop.fault ? null : (
            <button type="button" onClick={loop.toggleMute} aria-pressed={loop.muted} aria-label={loop.muted ? "Unmute" : "Mute"} className="flex size-12 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10">
              {loop.muted ? <MicOff className="size-5" aria-hidden="true" /> : <Mic className="size-5" aria-hidden="true" />}
            </button>
          )}
          <button type="button" onClick={end} className="flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-medium text-white hover:bg-white/10" style={{ background: "rgb(13 12 11)" }}>
            <PhoneOff className="size-4" aria-hidden="true" /> End call
          </button>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-md items-center gap-2">
          <label htmlFor="call-type" className="sr-only">Type instead</label>
          <input id="call-type" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type instead…" className="h-10 flex-1 rounded-full border border-white/20 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30" />
          <button type="submit" className="h-10 rounded-full border border-white/20 px-4 text-sm text-white hover:bg-white/10">Send</button>
        </form>
      </footer>
    </div>
  );
}
