import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { cachedRead } from "@/db/cache";
import { creators, users } from "@/db/schema";
import type { Viewer } from "@/features/auth/server/session";
import { listCampaignSummaries } from "@/features/campaigns/server/queries";
import { listBrandCollaborations, listCreatorCollaborations } from "@/features/collaborations/server/queries";
import { tag } from "@/lib/cache-tags";

export type CommandEntry = { id: string; label: string; hint?: string; href: string };
export type CommandIndex = { campaigns: CommandEntry[]; collaborations: CommandEntry[]; creators: CommandEntry[] };

async function loadCreatorDirectory() {
  return getDb()
    .select({ id: creators.id, handle: creators.handle, firstName: users.firstName, lastName: users.lastName })
    .from(creators)
    .innerJoin(users, eq(users.id, creators.userId))
    .orderBy(asc(users.firstName));
}

function creatorDirectory() {
  return cachedRead(loadCreatorDirectory, ["command-creators"], { tags: [tag.creatorDirectory()] })();
}

// What ⌘K can jump to, built from the same cached reads the pages use, so
// opening the menu costs nothing new. Loaded on first open, not with the shell.
export async function getCommandIndex(viewer: Viewer): Promise<CommandIndex> {
  if (viewer.brand) {
    const brandId = viewer.brand.id;
    const [campaigns, collabs, directory] = await Promise.all([listCampaignSummaries(brandId), listBrandCollaborations(brandId), creatorDirectory()]);
    return {
      campaigns: campaigns.map((c) => ({ id: c.id, label: c.name, href: `/brand/campaigns/${c.id}` })),
      collaborations: collabs.map((c) => ({ id: c.id, label: `${c.creatorName} · ${c.campaignName}`, href: `/brand/collaborations/${c.id}` })),
      creators: directory.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}`.trim(), hint: `@${c.handle}`, href: `/brand/creators?creator=${c.id}` })),
    };
  }
  if (viewer.creator) {
    const collabs = await listCreatorCollaborations(viewer.creator.id);
    return {
      campaigns: [],
      collaborations: collabs.map((c) => ({ id: c.id, label: `${c.brandCompany} · ${c.campaignName}`, href: `/creator/collaborations/${c.id}` })),
      creators: [],
    };
  }
  return { campaigns: [], collaborations: [], creators: [] };
}
