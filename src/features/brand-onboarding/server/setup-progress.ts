import "server-only";
import { brandSetup, type SetupProgress } from "@/lib/setup-steps";
import { loadOnboardingProfile } from "./queries";

// The brand's setup checklist: account, website read, profile finished.
export async function getBrandSetupProgress(brandId: string, completedAt: string | null): Promise<SetupProgress | null> {
  const profile = await loadOnboardingProfile(brandId);
  if (!profile) return null;
  return brandSetup({ hasWebsite: !!profile.website, onboarded: profile.onboarded, completedAt });
}
