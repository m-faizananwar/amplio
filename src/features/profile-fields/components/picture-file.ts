// Turns a picked file into the picture we store: cover-cropped to a square
// (the middle of a portrait or a landscape), drawn at 256px, encoded as WebP
// (JPEG where the browser can't write WebP), about 20 KB, as a data URL.
// Browser-only; nothing leaves the page until the caller saves it.
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const SIDE = 256;
const TARGET_CHARS = 28_000; // ~20 KB of image once base64 is taken off
const QUALITIES = [0.82, 0.72, 0.6, 0.5];

export type PictureResult = { ok: true; dataUrl: string } | { ok: false; reason: "tooBig" | "unreadable" };

function encode(canvas: HTMLCanvasElement, quality: number): string | null {
  const webp = canvas.toDataURL("image/webp", quality);
  if (webp.startsWith("data:image/webp")) return webp;
  // a browser that can't write WebP hands back a PNG: ask for JPEG instead
  const jpeg = canvas.toDataURL("image/jpeg", quality);
  return jpeg.startsWith("data:image/jpeg") ? jpeg : null;
}

export async function toPicture(file: File): Promise<PictureResult> {
  if (file.size > MAX_FILE_BYTES) return { ok: false, reason: "tooBig" };
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, reason: "unreadable" };
  }
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIDE;
  canvas.height = SIDE;
  const ctx = canvas.getContext("2d");
  if (!ctx || side === 0) return { ok: false, reason: "unreadable" };
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIDE, SIDE);
  bitmap.close();
  let best: string | null = null;
  for (const q of QUALITIES) {
    best = encode(canvas, q);
    if (!best || best.length <= TARGET_CHARS) break;
  }
  return best ? { ok: true, dataUrl: best } : { ok: false, reason: "unreadable" };
}
