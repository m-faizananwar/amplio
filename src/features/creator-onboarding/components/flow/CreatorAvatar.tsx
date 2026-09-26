// The LinkedIn photo when the profile was read, else the initial.
export function CreatorAvatar({ name, url }: { name: string; url: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- a LinkedIn CDN photo; next/image would need its host allow-listed
    return <img src={url} alt="" width={48} height={48} className="size-12 rounded-full object-cover ring-2 ring-surface" />;
  }
  return <span className="flex size-12 items-center justify-center rounded-full bg-ink text-lead font-semibold text-paper" aria-hidden="true">{name.slice(0, 1) || "·"}</span>;
}
