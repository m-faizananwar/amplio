import { redirect } from "next/navigation";
import { ONBOARDING_ROUTES } from "@/features/brand-onboarding/constants";

// The draft is reviewed on the website screen now; older links land there.
export default function BrandOnboardingProfilePage() {
  redirect(ONBOARDING_ROUTES.website);
}
