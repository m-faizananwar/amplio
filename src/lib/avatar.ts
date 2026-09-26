// The seed's avatar source (scripts/seed/creators.ts avatarFor), shared with the
// UI so anything that only has a name still shows a picture. Deterministic:
// the same name always draws the same face. Pure.
const DICEBEAR = "https://api.dicebear.com/9.x";
const CREATOR_BG = "e8eefc,dbe4ff,eef2ff";

export function avatarFor(seed: string): string {
  return `${DICEBEAR}/notionists/svg?seed=${encodeURIComponent(seed.trim().toLowerCase())}&backgroundColor=${CREATOR_BG}`;
}

// A picture someone chose (an upload or their LinkedIn photo) rather than the
// generated placeholder face: only chosen pictures fill the picture field.
export function isChosenPicture(url: string | null | undefined): url is string {
  return !!url && !url.startsWith(DICEBEAR);
}
