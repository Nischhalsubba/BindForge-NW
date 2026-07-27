import type { Metadata } from "next";
import packageInfo from "../package.json";
import { BindForgeProvider } from "./BindForgeProvider";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";
import "./data/catalogIntegrity";
import "./app.css";

const productionUrl = new URL("https://neverwinterkeybind.netlify.app");

export const metadata: Metadata = {
  metadataBase: productionUrl,
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
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
    description: "Find safer key combinations and generate copy-ready Neverwinter bind or unbind commands.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BindForge NW Neverwinter keybind builder and command generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BindForge NW | Neverwinter Keybind Builder",
    description: "Search presets and generate copy-ready Neverwinter keybind commands.",
    images: ["/opengraph-image"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BindForge NW",
  url: `${productionUrl}/`,
  applicationCategory: "GameApplication",
  applicationSubCategory: "Neverwinter keybind builder and console command generator",
  operatingSystem: "Any operating system with a modern web browser",
  description: "A browser-based Neverwinter keybind builder for searching presets, console commands, and key combinations and generating copy-ready bind and unbind commands.",
  softwareVersion: packageInfo.version,
  isAccessibleForFree: true,
  author: { "@type": "Person", name: "Nischhal Raj Subba", url: "https://github.com/Nischhalsubba" },
  codeRepository: "https://github.com/Nischhalsubba/BindForge-NW",
  featureList: [
    "Neverwinter keybind preset library",
    "Editable key-combination previews",
    "Bulk bind and unbind packs",
    "Favourites and named local collections",
    "Shareable library views",
    "Conflict replacement guidance",
    "Preset provenance and confidence filters",
    "Custom say-message keybind generator",
    "Automatic browser-local settings backup",
    "JSON backup export and import",
    "Neverwinter console command search",
    "Custom bind and unbind command generation",
    "Class, action, and difficulty filtering",
    "Reserved and risky key warnings",
    "Keyboard-accessible responsive interface",
    "Installable offline application shell",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
        <ServiceWorkerRegistration />
        <BindForgeProvider>{children}</BindForgeProvider>
      </body>
    </html>
  );
}
