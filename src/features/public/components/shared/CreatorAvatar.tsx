import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { avatarFor } from "@/lib/avatar";

type Props = { name: string; src?: string | null; className?: string };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// Always a picture: the given src, else the seed's deterministic avatar for
// the name. Initials only appear if the image fails to load.
export function CreatorAvatar({ name, src, className }: Props) {
  return (
    <Avatar className={cn("bg-brand-soft", className)}>
      <AvatarImage src={src ?? avatarFor(name)} alt="" />
      <AvatarFallback className="bg-brand-soft text-xs font-semibold text-brand">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
