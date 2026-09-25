// Renders the icon PNGs from public/favicon.svg (the mark on a paper disc,
// heavier strokes for tab size) and public/mark.svg (the bare mark, padded
// onto the same disc for the touch icon). Run after changing the mark:
// node scripts/icons.mjs
import { readFileSync } from "node:fs";
import sharp from "sharp";

const favicon = readFileSync("public/favicon.svg");
const mark = readFileSync("public/mark.svg");
const MARK_SHARE = 0.62;

const disc = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#FAFAF7"/><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 0.5}" fill="none" stroke="#111111" stroke-opacity="0.1" stroke-width="1"/></svg>`,
  );

async function fromFavicon(size, out) {
  await sharp(favicon, { density: 600 }).resize(size, size).png().toFile(out);
  console.log(out);
}
async function fromMark(size, out) {
  const glyph = await sharp(mark, { density: 1200 }).resize(Math.round(size * MARK_SHARE)).png().toBuffer();
  await sharp(disc(size)).composite([{ input: glyph, gravity: "centre" }]).png().toFile(out);
  console.log(out);
}

await fromFavicon(16, "public/favicon-16.png");
await fromFavicon(32, "public/favicon-32.png");
await fromMark(180, "public/apple-touch-icon.png");
await fromMark(192, "public/icon-192.png");
await fromMark(512, "public/icon-512.png");
