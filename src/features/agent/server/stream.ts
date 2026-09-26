import "server-only";
import { type AgentEvent, sse } from "../events";

// Runs `work` and streams whatever it emits as Server-Sent Events, ending
// with `done` (carrying the thread id work returns) or `error` if it throws. The error text is friendly; the
// cause is logged server-side only.
export function eventStream(work: (emit: (e: AgentEvent) => void) => Promise<string | null | void>, meta: { userId: string }): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const emit = (e: AgentEvent) => controller.enqueue(encoder.encode(sse(e)));
      try {
        const threadId = await work(emit);
        emit({ type: "done", threadId: threadId ?? null });
      } catch (error) {
        console.error("[agent] turn failed", { userId: meta.userId, error: error instanceof Error ? error.message : String(error) });
        emit({ type: "error", message: "Something went wrong on our side. Try again in a moment.", retryable: true });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, { headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", connection: "keep-alive" } });
}
