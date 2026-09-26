import "server-only";
import { brandSetup, type SetupProgress } from "@/lib/setup-steps";
import { loadOnboardingProfile } from "./queries";

// The brand's setup checklist: account, website read into a draft, profile finished.
export async function getBrandSetupProgress(brandId: string, completedAt: string | null): Promise<SetupProgress | null> {
  const profile = await loadOnboardingProfile(brandId);
  if (!profile) return null;
  // sign-up prefills the website from the email's domain: the step is done once it has been read into a draft
  const read = !!profile.website && (profile.valueProp.trim().length > 0 || profile.icps.some((i) => i.title.trim()));
  return brandSetup({ hasWebsite: read, onboarded: profile.onboarded, completedAt });
}
