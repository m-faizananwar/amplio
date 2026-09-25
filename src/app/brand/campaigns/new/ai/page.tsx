import { redirect } from "next/navigation";

// The composer is /brand/campaigns/new now; old links land there.
export default function CreateWithAiPage() {
  redirect("/brand/campaigns/new");
}
