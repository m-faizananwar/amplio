import { Skeleton } from "@/components/ui/skeleton";

// The onboarding column while the step loads: rail, title, one field.
export function OnboardingLoading() {
  return (
    <div className="flex min-h-[100svh] justify-center bg-paper px-4 pt-28" aria-busy="true" aria-label="Loading">
      <div className="grid w-full max-w-[36rem] content-start gap-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
