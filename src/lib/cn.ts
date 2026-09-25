import { createCn } from "cn/config";

// The class merger every component uses. The stock `cn` doesn't know our type
// scale, and treats an unknown `text-*` as a colour — so `cn("text-paper",
// "text-body")` silently dropped the colour. Registering the scale (and the
// ledger radius/shadow names) as their real groups fixes that for every call.
// Import from here, not from "@/lib/cn" (lint enforces it).
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["caption", "small", "body", "lead", "h4", "h3", "h2", "h1", "display"] }],
      shadow: [{ shadow: ["float"] }],
      rounded: [{ rounded: ["chip", "card", "control"] }],
    },
  },
});
