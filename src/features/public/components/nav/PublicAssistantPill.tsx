import { AssistantMount } from "@/features/assistant/components/AssistantMount";

// The public site's floating assistant: a static shell at paint, the widget
// loaded on idle / approach (logged out, it answers about the product).
// On every public page it starts as the small corner button, so the pill
// never sits over content until the visitor asks for it (their choice is
// remembered). On compact frames it steps aside while the landing's hero is
// at the top (html[data-hero-top]), where it would cover Open the demo.
export function PublicAssistantPill({ startHidden = true }: { startHidden?: boolean }) {
  return <div className="public-assistant"><AssistantMount mode="public" startHidden={startHidden} /></div>;
}
