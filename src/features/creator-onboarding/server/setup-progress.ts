import "server-only";
import { creatorSetup, type SetupProgress } from "@/lib/setup-steps";
import { PRICE_FLOOR_CENTS } from "@/lib/recommend-price";
import { getOnboardingState, type OnboardingState } from "./queries";

// The creator's setup checklist from their onboarding row.
export function creatorProgress(state: OnboardingState, completedAt: string | null): SetupProgress {
  const p = state.professional;
  return creatorSetup({
    profileRead: state.profileRead,
    cardCompleted: state.cardCompleted,
    // the €20 floor is a registration placeholder, not a chosen price
    priceChosen: state.onboarded || state.priceCents !== PRICE_FLOOR_CENTS,
    legalDone: !!(p.legalName && p.legalAddress && p.taxAcknowledged && p.invoicingAuthorized),
    onboarded: state.onboarded,
    completedAt,
  });
}

// For the shell (sidebar badge, Overview card); null when the row can't be read.
export async function getCreatorSetupProgress(creatorId: string, completedAt: string | null): Promise<SetupProgress | null> {
  try {
    const state = await getOnboardingState(creatorId);
    return state ? creatorProgress(state, completedAt) : null;
  } catch (error) {
    console.error("[creator-onboarding] setup progress unavailable", { creatorId, error });
    return null;
  }
}
