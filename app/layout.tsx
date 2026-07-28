import type { Metadata } from "next";
import packageInfo from "../package.json";
import { BindForgeProvider } from "./BindForgeProvider";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";
import "./data/catalogIntegrity";
import "./app.css";

const productionUrl = new URL("https://neverwinterkeybind.netlify.app");
const socialImageUrl = new URL("/opengraph-image?v=20260728-archew", productionUrl).toString();
const socialTitle = "BindForge NW | Neverwinter Keybind Builder";
const socialDescription =
  "Search presets, choose safer key combinations, and generate copy-ready Neverwinter bind or unbind commands.";

export const metadata: Metadata = {
  metadataBase: productionUrl,
  alternates: {
    canonical: productionUrl.toString(),
  },
  manifest: "/manifest.webmanifest",
  title: {
    default: socialTitle,
    template: "%s | BindForge NW",
  },
  description: socialDescription,
  applicationName: "BindForge NW",
  keywords: [
    "Neverwinter keybind builder",
    "Neverwinter bind commands",
    "Neverwinter console commands",
    "Neverwinter Bard song binds",
    "Neverwinter command generator",
  ],
  authors: [{ name: "Archew" }],
  creator: "Archew",
  publisher: "Archew",
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
    locale: "en_US",
    url: productionUrl.toString(),
    siteName: "BindForge NW",
    title: socialTitle,
    description: socialDescription,
    images: [
      {
        url: socialImageUrl,
        secureUrl: socialImageUrl,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "BindForge NW Neverwinter keybind builder showing a generated command preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
    images: [{ url: socialImageUrl, alt: "BindForge NW Neverwinter keybind builder preview" }],
  },
  other: {
    "og:image": socialImageUrl,
    "og:image:secure_url": socialImageUrl,
    "og:image:type": "image/png",
    "og:image:width": "1200",
    "og:image:height": "630",
    "twitter:image": socialImageUrl,
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
  author: { "@type": "Organization", name: "Archew" },
  creator: { "@type": "Organization", name: "Archew" },
  publisher: { "@type": "Organization", name: "Archew" },
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
