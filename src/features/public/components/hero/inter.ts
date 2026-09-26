import { Inter } from "next/font/google";

// Inter, variable 100–900, self-hosted by next/font and scoped to the glass
// hero and the public header (the rest of the site stays on Geist).
export const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-hero" });
