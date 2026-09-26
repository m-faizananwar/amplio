import { Inter, Instrument_Sans, JetBrains_Mono } from "next/font/google";

// The app's faces (DIRECTION.md, "Type"). Declared in the root layout so a
// dialog or a dropdown portalled to <body> can use them, but not preloaded:
// the public pages keep Geist and should not pay for these. They switch on
// wherever `.font-app` is mounted (the app shell, the auth pages).
export const instrumentSans = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"], display: "swap", preload: false });
export const interApp = Inter({ variable: "--font-inter-app", subsets: ["latin"], display: "swap", preload: false });
export const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap", preload: false });
