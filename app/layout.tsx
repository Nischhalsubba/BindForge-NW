import type { Metadata } from "next";
import { Barlow_Condensed, JetBrains_Mono, Source_Sans_3 } from "next/font/google";
import LocalSettingsManager from "./LocalSettingsManager";
import "./globals.css";
import "./local-settings.css";
import "./theme.css";

const appInterface = Source_Sans_3({
  variable: "--font-interface",
  subsets: ["latin"],
  display: "swap",
});

const appCode = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const appDisplay = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "BindForge NW | Neverwinter Keybind Builder",
    template: "%s | BindForge NW",
  },
  description:
    "Search, review, and generate copy-ready Neverwinter keybind and unbind commands with editable key combinations and conflict warnings.",
  applicationName: "BindForge NW",
  keywords: [
    "Neverwinter keybind builder",
    "Neverwinter bind commands",
    "Neverwinter console commands",
    "Neverwinter Bard song binds",
    "Neverwinter command generator",
  ],
  authors: [{ name: "Nischhal Raj Subba", url: "https://github.com/Nischhalsubba" }],
  creator: "Nischhal Raj Subba",
  publisher: "Nischhal Raj Subba",
  category: "gaming tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "BindForge NW",
    title: "BindForge NW | Neverwinter Keybind Builder",
    description:
      "Find safer key combinations and generate copy-ready Neverwinter bind or unbind commands.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BindForge NW Neverwinter keybind builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BindForge NW | Neverwinter Keybind Builder",
    description: "Search presets and generate copy-ready Neverwinter keybind commands.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BindForge NW",
    applicationCategory: "GameApplication",
    applicationSubCategory: "Neverwinter keybind builder and console command generator",
    operatingSystem: "Any operating system with a modern web browser",
    description:
      "A browser-based Neverwinter keybind builder for searching presets, console commands, and key combinations and generating copy-ready bind and unbind commands.",
    softwareVersion: "0.4.0",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: "Nischhal Raj Subba",
      url: "https://github.com/Nischhalsubba",
    },
    codeRepository: "https://github.com/Nischhalsubba/BindForge-NW",
    featureList: [
      "Neverwinter keybind preset library",
      "Editable key-combination previews",
      "Automatic browser-local settings backup",
      "JSON backup export and import",
      "Neverwinter console command search",
      "Custom bind and unbind command generation",
      "Class, action, and difficulty filtering",
      "Reserved and risky key warnings",
      "Keyboard-accessible responsive interface",
    ],
  };

  return (
    <html lang="en">
      <body className={`${appInterface.variable} ${appCode.variable} ${appDisplay.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <LocalSettingsManager />
      </body>
    </html>
  );
}
