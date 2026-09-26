// The microphone for the call: asks once (a denial is its own state, with
// chat offered), then reads a 0–1 level for the dots from an AnalyserNode.
export type Mic = { read: () => number; close: () => void };
export type MicResult = { ok: true; mic: Mic } | { ok: false; reason: "denied" | "unavailable" };

const FFT = 256;
const FULL_SCALE = 255;
const GAIN = 2.2;

export async function openMic(): Promise<MicResult> {
  if (!navigator.mediaDevices?.getUserMedia) return { ok: false, reason: "unavailable" };
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
    return { ok: false, reason: denied ? "denied" : "unavailable" };
  }
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = FFT;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  return {
    ok: true,
    mic: {
      read: () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (const v of data) sum += v;
        return Math.min(1, (sum / data.length / FULL_SCALE) * GAIN);
      },
      close: () => {
        stream.getTracks().forEach((track) => track.stop());
        void ctx.close();
      },
    },
  };
}
