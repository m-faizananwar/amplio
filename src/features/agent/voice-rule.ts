// On a call, a spoken answer only settles the card that is pending right now
// for this user and thread; anything else is a new request and the card stays
// pending. Pure.
const YES = /^(yes|yeah|yep|yup|sure|ok|okay|confirm|confirmed|do it|go ahead|book them|book it|please do|oui|ouais|d'accord|d’accord|vas-y|allez-y|confirme|confirmé|c'est bon|c’est bon)\b/i;
const NO = /^(no|nope|cancel|stop|don't|do not|not now|never mind|nevermind|non|annule|pas maintenant|laisse tomber)\b/i;

export type VoiceDecision = { kind: "confirm" | "cancel"; id: string } | { kind: "turn" } | { kind: "nothing" };

export function decideSpoken(transcript: string, pendingId: string | null): VoiceDecision {
  const said = transcript.trim().replace(/^[\s,.!?"“”]+/, "");
  // a bare yes/no with no card waiting answers nothing; it is not a new request
  const bare = said.replace(/[\s,.!?]+$/, "").split(/\s+/).length <= 3;
  if (!pendingId) return bare && (YES.test(said) || NO.test(said)) ? { kind: "nothing" } : { kind: "turn" };
  if (NO.test(said)) return { kind: "cancel", id: pendingId };
  if (YES.test(said)) return { kind: "confirm", id: pendingId };
  return { kind: "turn" };
}
