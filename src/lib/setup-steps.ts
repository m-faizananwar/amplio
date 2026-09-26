// The setup checklist both roles work through inside the app: which steps
// exist, which are done, what's next. The account step is always done (it's
// the sign-up). Pure: the callers read the rows and pass plain facts in.

export type SetupStepKey = "account" | "linkedin" | "card" | "price" | "legal" | "website" | "profile";
export type SetupStep = { key: SetupStepKey; done: boolean; skippable: boolean };
export type SetupProgress = {
  steps: SetupStep[];
  done: number;
  total: number;
  // onboarding completed (a skipped step doesn't hold it open)
  finished: boolean;
  next: SetupStepKey | null;
  completedAt: string | null;
};

function progress(steps: SetupStep[], finished: boolean, completedAt: string | null): SetupProgress {
  const done = steps.filter((s) => s.done).length;
  return { steps, done, total: steps.length, finished, next: steps.find((s) => !s.done)?.key ?? null, completedAt };
}

type CreatorFacts = { profileRead: boolean; cardCompleted: boolean; priceChosen: boolean; legalDone: boolean; onboarded: boolean; completedAt: string | null };

export function creatorSetup(f: CreatorFacts): SetupProgress {
  return progress(
    [
      { key: "account", done: true, skippable: false },
      { key: "linkedin", done: f.profileRead, skippable: true },
      { key: "card", done: f.cardCompleted, skippable: false },
      { key: "price", done: f.priceChosen, skippable: false },
      { key: "legal", done: f.legalDone, skippable: true },
    ],
    f.onboarded,
    f.completedAt,
  );
}

type BrandFacts = { hasWebsite: boolean; onboarded: boolean; completedAt: string | null };

export function brandSetup(f: BrandFacts): SetupProgress {
  return progress(
    [
      { key: "account", done: true, skippable: false },
      { key: "website", done: f.hasWebsite, skippable: false },
      { key: "profile", done: f.onboarded, skippable: false },
    ],
    f.onboarded,
    f.completedAt,
  );
}
