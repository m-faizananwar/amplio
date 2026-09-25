import { AssistantMount } from "@/features/assistant/components/AssistantMount";

// The public site's floating assistant: a static shell at paint, the widget
// loaded on idle / approach (logged out, it answers about the product).
// On every public page it starts as the small corner button, so the pill
// never sits over content until the visitor asks for it (their choice is
// remembered).
export function PublicAssistantPill({ startHidden = true }: { startHidden?: boolean }) {
  return <AssistantMount mode="public" startHidden={startHidden} />;
}
