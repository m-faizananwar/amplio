// What the shell needs to know about who is looking. Built by the layouts;
// a "preview" viewer is used when the database is not configured.
export type ShellViewer = {
  role: "brand" | "creator";
  firstName: string;
  lastName: string;
  workspace: string;
  /** Shown under the account pill's header when it opens. */
  email: string;
  avatarUrl: string | null;
  walletCents: number;
  csrfToken: string;
  preview: boolean;
  /** A demo account: gets the brand/creator switch in the top bar. */
  demo: boolean;
  notifications: ShellNotification[];
  launchPlan: { explored: boolean; briefed: boolean; invited: boolean; stepsLeft: number } | null;
};

export type ShellNotification = {
  id: string;
  kind: "status" | "message";
  status: import("@/lib/collaboration-status").CollaborationStatus | null;
  resubmitted: boolean;
  counterpart: string;
  campaign: string;
  href: string;
  at: string;
};

export function initialsOf(viewer: Pick<ShellViewer, "firstName" | "lastName">) {
  return `${viewer.firstName.charAt(0)}${viewer.lastName.charAt(0)}`.toUpperCase() || "N";
}
