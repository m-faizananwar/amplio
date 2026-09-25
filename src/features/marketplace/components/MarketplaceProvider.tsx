"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { CreatorDto, MarketplaceContextDto } from "../schemas";
import { toggleShortlist as toggleShortlistAction } from "../server/actions";
import { SelectionDialog } from "./booking/SelectionDialog";
import { OfferDialog } from "./booking/OfferDialog";
import { CreatorProfileDrawer } from "./profile/CreatorProfileDrawer";
import { type BookingState, type BookingStep, MarketplaceContext, type MarketplaceState } from "./useMarketplace";

type Props = { ctx: MarketplaceContextDto; children: ReactNode };

// Shared client state for the marketplace and Nao views: optimistic
// shortlist + invitation overrides, the profile modal and the booking flow.
export function MarketplaceProvider({ ctx, children }: Props) {
  const router = useRouter();
  const [shortlistOverrides, setShortlistOverrides] = useState<Record<string, boolean>>({});
  const [invitedOverrides, setInvitedOverrides] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<CreatorDto | null>(null);
  const [booking, setBooking] = useState<BookingState>(null);

  const isShortlisted = useCallback(
    (creator: CreatorDto) => shortlistOverrides[creator.id] ?? creator.shortlisted,
    [shortlistOverrides],
  );

  const toggleShortlist = useCallback(
    (creator: CreatorDto) => {
      const next = !(shortlistOverrides[creator.id] ?? creator.shortlisted);
      setShortlistOverrides((prev) => ({ ...prev, [creator.id]: next }));
      void toggleShortlistAction({ creatorId: creator.id, shortlisted: next }).then((result) => {
        if (!result.ok) {
          setShortlistOverrides((prev) => ({ ...prev, [creator.id]: !next }));
          toast.error(result.error);
          return;
        }
        toast.success(next ? `${creator.name} added to your shortlist` : `${creator.name} removed from your shortlist`);
        router.refresh();
      });
    },
    [router, shortlistOverrides],
  );

  const collaborationStatus = useCallback(
    (creator: CreatorDto) => invitedOverrides[creator.id] ?? creator.collaborationStatus,
    [invitedOverrides],
  );

  const markInvited = useCallback(
    (creatorId: string, status: string) => {
      setInvitedOverrides((prev) => ({ ...prev, [creatorId]: status }));
      router.refresh();
    },
    [router],
  );

  const setBookingStep = useCallback((step: BookingStep, acceptBy?: string | null) => {
    setBooking((prev) => (prev ? { ...prev, step, acceptBy: acceptBy ?? prev.acceptBy } : prev));
  }, []);

  const value = useMemo<MarketplaceState>(
    () => ({
      ctx,
      isShortlisted,
      toggleShortlist,
      collaborationStatus,
      markInvited,
      profile,
      openProfile: setProfile,
      closeProfile: () => setProfile(null),
      booking,
      openBooking: (creator) => setBooking({ creator, step: "selection" }),
      setBookingStep,
      closeBooking: () => setBooking(null),
    }),
    [ctx, isShortlisted, toggleShortlist, collaborationStatus, markInvited, profile, booking, setBookingStep],
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
      <CreatorProfileDrawer />
      <SelectionDialog />
      <OfferDialog />
    </MarketplaceContext.Provider>
  );
}
