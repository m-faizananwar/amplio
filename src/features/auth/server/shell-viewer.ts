import "server-only";
import { redirect } from "next/navigation";
import { isDbConfigured } from "@/db";
import type { ShellViewer } from "@/components/shell/viewer";
import { isDemoEmail, ROLE_HOME, ROLE_ONBOARDING } from "../constants";
import type { Role } from "../schemas";
import { getLaunchPlan } from "@/features/campaigns/server/queries";
import { getBrandNotifications, getCreatorNotifications } from "@/features/workspace/server/notifications";
import { getViewer, type Viewer } from "./session";

const PREVIEW: Record<Role, ShellViewer> = {
  brand: { role: "brand", firstName: "Demo", lastName: "Brand", workspace: "Preview workspace", email: "", avatarUrl: null, walletCents: 0, csrfToken: "", preview: true, demo: false, notifications: [], launchPlan: null },
  creator: { role: "creator", firstName: "Demo", lastName: "Creator", workspace: "Preview workspace", email: "", avatarUrl: null, walletCents: 0, csrfToken: "", preview: true, demo: false, notifications: [], launchPlan: null },
};

export async function toShellViewer(viewer: Viewer): Promise<ShellViewer> {
  const notifications = viewer.brand
    ? await getBrandNotifications(viewer.brand.id, viewer.userId)
    : viewer.creator
      ? await getCreatorNotifications(viewer.creator.id, viewer.userId)
      : [];
  const launchPlan = viewer.brand ? await getLaunchPlan(viewer.brand.id) : null;
  return {
    notifications,
    launchPlan,
    role: viewer.role,
    firstName: viewer.firstName,
    lastName: viewer.lastName,
    workspace: viewer.brand?.company ?? (viewer.creator ? `@${viewer.creator.handle}` : viewer.email),
    email: viewer.email,
    avatarUrl: viewer.creator?.avatarUrl ?? null,
    walletCents: viewer.brand?.walletCents ?? viewer.creator?.availableCents ?? 0,
    csrfToken: viewer.csrfToken,
    preview: false,
    demo: isDemoEmail(viewer.email),
  };
}

// Used by the /brand and /creator layouts. Redirects when the session is
// missing or belongs to the other role; returns a preview viewer when there
// is no database so the shells stay browsable.
export async function resolveShellViewer(role: Role, pathname: string) {
  if (!isDbConfigured()) return { mode: "unconfigured" as const, shell: PREVIEW[role] };
  const viewer = await getViewer();
  // No viewer with a cookie present = the row is gone or expired: clear the cookie on the way to /login.
  if (!viewer) redirect(`/api/auth/expired?next=${encodeURIComponent(pathname)}`);
  if (viewer.role !== role) redirect(ROLE_HOME[viewer.role]);
  const onboarded = role === "brand" ? viewer.brand?.onboarded : viewer.creator?.onboarded;
  if (!onboarded) redirect(ROLE_ONBOARDING[role]);
  return { mode: "ok" as const, shell: await toShellViewer(viewer), viewer };
}
