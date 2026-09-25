import { permanentRedirect } from "next/navigation";

// The affiliate program is folded into My card ("Your links"); old links land there.
export default function CreatorAffiliateRedirect() {
  permanentRedirect("/creator/card#links");
}
