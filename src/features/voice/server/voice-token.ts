import "server-only";
import { createHmac } from "node:crypto";

// Shared secret Vapi echoes back in x-vapi-secret so only Vapi can call the
// webhook: VAPI_SERVER_SECRET when set, else derived from the private key
// (which never leaves the server), so it works before that is configured.
export function webhookSecret() {
  return process.env.VAPI_SERVER_SECRET || createHmac("sha256", process.env.VAPI_PRIVATE_KEY ?? "").update("vapi-webhook").digest("hex");
}
