import { AssistantMount } from "@/features/assistant/components/AssistantMount";

// The public site's floating assistant: a static shell at paint, the widget
// loaded on idle / approach (logged out, it answers about the product).
// `startHidden`: on the landing it starts as the corner button, so the pill
// never sits over the story until the visitor asks for it.
export function PublicAssistantPill({ startHidden = false }: { startHidden?: boolean }) {
  return <AssistantMount mode="public" startHidden={startHidden} />;
}
