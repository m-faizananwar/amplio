import { BrandMark } from "@/components/graphics/BrandMark";
import { PersonAvatar } from "@/components/ui/avatar";

export type PartyKind = "brand" | "person";

// Either side of a collaboration: a person shows their photo (initials as the
// fallback), a brand shows its trail mark, never a letter or stock art.
export function PartyAvatar({ name, kind, src, size = "default", className }: { name: string; kind: PartyKind; src?: string | null; size?: "sm" | "default" | "lg"; className?: string }) {
  if (kind === "brand") return <BrandMark name={name} size={size} className={className} />;
  return <PersonAvatar name={name} src={src} size={size} className={className} />;
}
