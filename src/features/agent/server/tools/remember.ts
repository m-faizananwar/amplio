import "server-only";
import { addNote } from "../memory";
import { obj, type ReadTool, str } from "./types";

const NOTE_MAX = 200;

// Saves a lasting preference the user stated; it comes back in every turn's
// context. Not a money or collaboration change, so no confirmation.
export const rememberTool = (role: "brand" | "creator"): ReadTool => ({
  name: "rememberPreference", role, kind: "read", label: "Remembering that",
  description: "Save a lasting preference the user stated (e.g. 'only French creators', 'budget €2k a month') so it is remembered next time.",
  parameters: obj({ note: str("The preference, one short line") }, ["note"]),
  async run(ctx, a) {
    const note = String(a.note ?? "").trim().slice(0, NOTE_MAX);
    const saved = note ? await addNote(ctx.viewer.userId, note) : false;
    return { summary: saved ? note : "couldn't save it this time", data: { saved } };
  },
});
