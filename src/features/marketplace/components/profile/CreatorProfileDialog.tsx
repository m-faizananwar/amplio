"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileModalSkeleton } from "@/components/skeleton/Skeletons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShortlistButton } from "../cards/ShortlistButton";
import { useMarketplace } from "../useMarketplace";
import { AudienceSnapshot } from "./AudienceSnapshot";
import { BookingRail } from "./BookingRail";
import { ContentPerformance } from "./ContentPerformance";
import { ProfileOverview } from "./ProfileOverview";

// The creator profile modal: Overview | Audience | Content + the booking rail.
export function CreatorProfileDialog() {
  const { profile: creator, closeProfile, ctx } = useMarketplace();
  const campaignName = ctx.selectedCampaign?.name ?? null;
  return (
    <Dialog open={creator !== null} onOpenChange={(open) => (open ? undefined : closeProfile())}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-5xl">
        {creator ? (
          <div className="grid gap-0 lg:grid-cols-[1fr_18rem]">
            <div className="p-5">
              <header className="flex items-start gap-3 pr-8">
                <Avatar className="size-14 rounded-full border">
                  <AvatarImage src={creator.avatarUrl} alt="" />
                  <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate text-lg">{creator.name}</DialogTitle>
                  <DialogDescription className="truncate">
                    {creator.industries.join(" · ")} · LinkedIn creator
                  </DialogDescription>
                </div>
                <ShortlistButton creator={creator} size="icon" />
              </header>
              <Tabs defaultValue="overview" className="mt-5">
                <TabsList variant="line">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <ProfileOverview creator={creator} campaignName={campaignName} />
                </TabsContent>
                <TabsContent value="audience" className="mt-4">
                  <AudienceSnapshot creator={creator} />
                </TabsContent>
                <TabsContent value="content" className="mt-4">
                  <ContentPerformance creator={creator} all />
                </TabsContent>
              </Tabs>
            </div>
            <div className="border-t p-5 lg:border-t-0 lg:border-l">
              <BookingRail creator={creator} />
            </div>
          </div>
        ) : (
          <ProfileModalSkeleton />
        )}
      </DialogContent>
    </Dialog>
  );
}
