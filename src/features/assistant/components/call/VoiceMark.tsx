"use client";

import { useEffect, useRef } from "react";

const FFT = 64;
const DOTS = 3;
const REST = 1;
const GAIN = 1.6;
const SPEAK_FREQ = 170;

// The mark, large, as the voice visualiser: each dot grows with its band of
// the mic level (AnalyserNode); while the assistant speaks they bounce on
// their own; while it thinks they settle. Transform only.
export function VoiceMark({ listening, speaking }: { listening: boolean; speaking: boolean }) {
  const root = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let raf = 0;
    let analyser: AnalyserNode | null = null;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    const data = new Uint8Array(FFT / 2);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paint = () => {
      const dots = root.current?.querySelectorAll<SVGCircleElement>("circle");
      if (!dots) return;
      analyser?.getByteFrequencyData(data);
      const t = performance.now() / SPEAK_FREQ;
      dots.forEach((dot, i) => {
        const band = analyser ? data[Math.floor(((i + 1) / (DOTS + 1)) * data.length)] / 255 : 0;
        const synth = speaking ? 0.35 * Math.abs(Math.sin(t + i * 0.9)) : 0;
        dot.style.transform = still ? "none" : `scale(${REST + GAIN * Math.max(band, synth)})`;
      });
      raf = requestAnimationFrame(paint);
    };
    if (listening && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        stream = s;
        ctx = new AudioContext();
        analyser = ctx.createAnalyser();
        analyser.fftSize = FFT;
        ctx.createMediaStreamSource(s).connect(analyser);
      }).catch(() => undefined);
    }
    raf = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
      void ctx?.close();
    };
  }, [listening, speaking]);
  return (
    <svg ref={root} viewBox="0 0 120 60" className="h-32 w-64 text-ink sm:h-40 sm:w-80" aria-hidden="true">
      <path d="M14 44 L60 18 L106 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      {[[14, 44], [60, 18], [106, 34]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="8" fill="currentColor" style={{ transformBox: "fill-box", transformOrigin: "center", transition: "transform 90ms linear" }} />
      ))}
    </svg>
  );
}
