import { z } from "zod";

// A profile picture or a brand logo, as the browser encoded it: a WebP or
// JPEG data URL of about 20 KB (256px square). The server takes up to 300 KB
// so a busy photo still fits; null removes the picture.
export const PICTURE_MAX_CHARS = 300_000;
export const PICTURE_PATTERN = /^data:image\/(webp|jpeg);base64,[A-Za-z0-9+/]+=*$/;

export const pictureSchema = z.object({
  dataUrl: z.string().max(PICTURE_MAX_CHARS, "That picture is too large.").regex(PICTURE_PATTERN, "That isn't a WebP or JPEG picture.").nullable(),
});
export type PictureInput = z.infer<typeof pictureSchema>;
