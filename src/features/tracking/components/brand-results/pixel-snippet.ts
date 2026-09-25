import { BRAND } from "@/config/brand";

// The two lines a brand pastes before </head>: the queue stub, then /n.js with the site key.
export function pixelSnippet(origin: string, siteKey: string) {
  return [
    `<script> window.${BRAND.pixelGlobal} = window.${BRAND.pixelGlobal} || function(){ (window.${BRAND.pixelGlobal}.q = window.${BRAND.pixelGlobal}.q || []).push(arguments); }; </script>`,
    `<script async src="${origin}/n.js" data-site="${siteKey}"></script>`,
  ].join("\n");
}
