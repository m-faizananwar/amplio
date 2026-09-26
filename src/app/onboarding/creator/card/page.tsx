import { redirect } from "next/navigation";

// Setup moved inside the app shell; old links land on the same step there.
export default function Page() {
  redirect("/creator/setup?step=card");
}
