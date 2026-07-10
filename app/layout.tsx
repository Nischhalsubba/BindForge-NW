import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BindForge NW | Neverwinter Keybind Builder & Command Generator",
    template: "%s | BindForge NW",
  },
  description:
    "Create copy-ready Neverwinter keybind and unbind commands. Search class presets, console commands, safe key combinations, Bard songs, targeting, VIP, combat, companion, camera, and utility binds.",
  applicationName: "BindForge NW",
  keywords: [
    "Neverwinter keybind builder",
    "Neverwinter bind commands",
    "Neverwinter console commands",
    "Neverwinter keybinds",
    "Neverwinter unbind command",
    "Neverwinter Bard song binds",
    "Neverwinter targeting bind",
    "Neverwinter animation cancel bind",
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
      "Build safe, copy-ready Neverwinter bind and unbind commands from presets, console commands, and custom key combinations.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BindForge NW Neverwinter keybind builder and command generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BindForge NW | Neverwinter Keybind Builder",
    description:
      "Search presets and generate copy-ready Neverwinter bind or unbind commands with key safety warnings.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BindForge NW",
    applicationCategory: "GameApplication",
    applicationSubCategory: "Neverwinter keybind builder and console command generator",
    operatingSystem: "Any operating system with a modern web browser",
    description:
      "A browser-based Neverwinter keybind builder for searching presets, console commands, and key combinations and generating copy-ready bind and unbind commands.",
    softwareVersion: "0.1.0",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: "Nischhal Raj Subba",
      url: "https://github.com/Nischhalsubba",
    },
    codeRepository: "https://github.com/Nischhalsubba/BindForge-NW",
    featureList: [
      "Neverwinter keybind preset library",
      "Neverwinter console command search",
      "Custom bind and unbind command generation",
      "Class, type, and safety filtering",
      "Reserved and risky key warnings",
      "Bard song and animation-cancel presets",
      "Clipboard-ready command output",
    ],
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
