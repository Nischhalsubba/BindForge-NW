import type { Metadata } from "next";
import { BindForgeProvider } from "./BindForgeProvider";
import "./data/catalogIntegrity";
import "./globals.css";
import "./local-settings.css";
import "./theme.css";
import "./apple-theme.css";
import "./sidebar-spacing.css";
import "./filter-dock.css";
import "./sticky-filter-dock.css";
import "./split-filter-layout.css";
import "./organized-layout.css";
import "./apple-appearance.css";
import "./alignment-polish.css";
import "./sidebar-stabilization.css";
import "./mobile-first.css";
import "./production-verification.css";
import "./open-design.css";
import "./open-design-structure.css";
import "./apple-design-spec.css";

const productionUrl = new URL("https://bindforge-nw.hinischalsubba.workers.dev");

export const metadata: Metadata = {
  metadataBase: productionUrl,
  alternates: {
    canonical: "/",
  },
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
    url: "/",
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
    url: productionUrl.toString(),
    applicationCategory: "GameApplication",
    applicationSubCategory: "Neverwinter keybind builder and console command generator",
    operatingSystem: "Any operating system with a modern web browser",
    description:
      "A browser-based Neverwinter keybind builder for searching presets, console commands, and key combinations and generating copy-ready bind and unbind commands.",
    softwareVersion: "0.8.0",
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
      "Custom say-message keybind generator",
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <BindForgeProvider>{children}</BindForgeProvider>
      </body>
    </html>
  );
}
