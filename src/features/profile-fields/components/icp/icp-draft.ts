import { ICP_DESCRIPTION_MAX_CHARS, ICP_TITLE_MAX_CHARS } from "@/features/brand-onboarding/constants";

export type Icp = { title: string; description: string };
export type IcpProblem = { title?: "required" | "long"; description?: "required" | "long" };

// What the dialog checks before it saves, the same limits as the schema.
export function problemsOf(icp: Icp): IcpProblem {
  const p: IcpProblem = {};
  if (!icp.title.trim()) p.title = "required";
  else if (icp.title.length > ICP_TITLE_MAX_CHARS) p.title = "long";
  if (!icp.description.trim()) p.description = "required";
  else if (icp.description.length > ICP_DESCRIPTION_MAX_CHARS) p.description = "long";
  return p;
}

export const sameIcps = (a: Icp[], b: Icp[]) => a.every((x, i) => x.title === b[i]?.title && x.description === b[i]?.description);
