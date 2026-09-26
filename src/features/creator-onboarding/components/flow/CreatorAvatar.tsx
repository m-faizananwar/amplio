import { Silhouette } from "@/components/Silhouette";
import { isChosenPicture } from "@/lib/avatar";

// The creator's chosen photo (an upload or their LinkedIn one), else the
// silhouette: a gap to fill, not a generated face.
export function CreatorAvatar({ url }: { url: string }) {
  if (isChosenPicture(url)) {
    // eslint-disable-next-line @next/next/no-img-element -- a data URL or a LinkedIn CDN photo; next/image would need hosts allow-listed
    return <img src={url} alt="" width={48} height={48} className="size-12 rounded-full object-cover ring-2 ring-surface" />;
  }
  return <span className="block size-12 overflow-hidden rounded-full ring-2 ring-surface"><Silhouette /></span>;
}
